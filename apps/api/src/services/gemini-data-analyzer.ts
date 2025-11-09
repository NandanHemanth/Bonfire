import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface AnalysisResult {
  summary: string;
  charts: ChartData[];
  insights: string[];
  statistics: Record<string, any>;
}

interface ChartData {
  type: 'bar' | 'line' | 'scatter' | 'pie';
  title: string;
  data: any[];
  xKey?: string;
  yKey?: string;
}

export async function analyzeDataWithGemini(
  data: any[],
  filename: string
): Promise<AnalysisResult> {
  try {
    // Validate API key
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    // Validate data
    if (!data || data.length === 0) {
      throw new Error('No data provided');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Get column names and sample data
    const columns = Object.keys(data[0] || {});
    if (columns.length === 0) {
      throw new Error('No columns found in data');
    }

    const sampleData = data.slice(0, 10);

    // Calculate basic statistics
    const statistics = calculateStatistics(data, columns);

    // Create prompt for Gemini
    const prompt = `
You are a data analyst. Analyze this CSV data and provide comprehensive insights.

Filename: ${filename}
Total Rows: ${data.length}
Columns: ${columns.join(', ')}

Sample Data (first 10 rows):
${JSON.stringify(sampleData, null, 2)}

Statistics:
${JSON.stringify(statistics, null, 2)}

Please provide:
1. A brief summary of the dataset (2-3 sentences)
2. 5-7 key insights and patterns you observe
3. Suggest 4-6 different chart types that would best visualize this data (specify chart type, title, and which columns to use)

Format your response as JSON with this structure:
{
  "summary": "Brief overview of the data",
  "insights": ["insight 1", "insight 2", ...],
  "charts": [
    {
      "type": "bar|line|scatter|pie",
      "title": "Chart title",
      "xKey": "column name for x-axis",
      "yKey": "column name for y-axis"
    }
  ]
}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('Gemini response received, parsing...');

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Failed to extract JSON from Gemini response:', text);
      throw new Error('Failed to parse Gemini response - no JSON found');
    }

    let analysis;
    try {
      analysis = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Failed to parse JSON:', jsonMatch[0]);
      throw new Error('Failed to parse Gemini response - invalid JSON');
    }

    // Validate response structure
    if (!analysis.summary || !analysis.insights || !analysis.charts) {
      console.error('Invalid analysis structure:', analysis);
      throw new Error('Gemini response missing required fields');
    }

    // Generate chart data
    const chartsWithData = analysis.charts.map((chart: any) => ({
      ...chart,
      data: generateChartData(data, chart),
    }));

    return {
      summary: analysis.summary,
      insights: analysis.insights,
      charts: chartsWithData,
      statistics,
    };
  } catch (error) {
    console.error('Error in Gemini analysis:', error);
    
    // If Gemini fails, provide a basic fallback analysis
    if (error instanceof Error && error.message.includes('API key')) {
      throw error; // Re-throw API key errors
    }
    
    // Return basic analysis as fallback
    const columns = Object.keys(data[0] || {});
    const statistics = calculateStatistics(data, columns);
    
    return {
      summary: `Analysis of ${filename} with ${data.length} rows and ${columns.length} columns. Basic statistics calculated successfully.`,
      insights: [
        `Dataset contains ${data.length} records`,
        `Found ${columns.length} columns: ${columns.join(', ')}`,
        'AI-powered insights temporarily unavailable - showing basic statistics',
      ],
      charts: [
        {
          type: 'bar',
          title: 'Column Distribution',
          data: [],
          xKey: columns[0],
          yKey: columns[1] || columns[0],
        },
      ],
      statistics,
    };
  }
}

function calculateStatistics(data: any[], columns: string[]): Record<string, any> {
  const stats: Record<string, any> = {};

  columns.forEach((col) => {
    const values = data.map((row) => row[col]).filter((v) => v !== null && v !== undefined);
    const numericValues = values.filter((v) => !isNaN(Number(v))).map(Number);

    if (numericValues.length > 0) {
      stats[col] = {
        type: 'numeric',
        count: numericValues.length,
        mean: numericValues.reduce((a, b) => a + b, 0) / numericValues.length,
        min: Math.min(...numericValues),
        max: Math.max(...numericValues),
        median: calculateMedian(numericValues),
      };
    } else {
      const uniqueValues = [...new Set(values)];
      stats[col] = {
        type: 'categorical',
        count: values.length,
        unique: uniqueValues.length,
        topValues: getTopValues(values, 5),
      };
    }
  });

  return stats;
}

function calculateMedian(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function getTopValues(values: any[], limit: number): Array<{ value: any; count: number }> {
  const counts = values.reduce((acc, val) => {
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(counts)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, limit)
    .map(([value, count]) => ({ value, count: count as number }));
}

function generateChartData(data: any[], chart: any): any[] {
  const { type, xKey, yKey } = chart;

  if (type === 'pie') {
    // For pie charts, aggregate by category
    const counts = data.reduce((acc, row) => {
      const key = row[xKey];
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }

  if (type === 'bar' || type === 'line') {
    // For bar/line charts, use x and y keys
    return data.slice(0, 50).map((row) => ({
      [xKey]: row[xKey],
      [yKey]: Number(row[yKey]) || 0,
    }));
  }

  if (type === 'scatter') {
    // For scatter plots, use x and y keys
    return data.slice(0, 100).map((row) => ({
      x: Number(row[xKey]) || 0,
      y: Number(row[yKey]) || 0,
    }));
  }

  return [];
}
