import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import ReactMarkdown from 'react-markdown';

interface Enhanced3DViewerProps {
  owner: string;
  repo: string;
}

interface VisualizationFilters {
  showFiles: boolean;
  showDirectories: boolean;
  showFunctions: boolean;
  showConnections: boolean;
  showAPIs: boolean;
  showImports: boolean;
  showExports: boolean;
}

interface DeepAnalysisData {
  functions: Array<{
    name: string;
    line: number;
    file: string;
    type: string;
  }>;
  connections: Array<{
    source: string;
    target: string;
    type: string;
    line?: number;
  }>;
  apis: Array<{
    method: string;
    path: string;
    file: string;
    line: number;
    type: string;
  }>;
  hierarchy: any[];
  imports: Map<string, string[]>;
  exports: Map<string, string[]>;
}

interface IntegrationData {
  slack: boolean;
  jira: boolean;
  database: string[];
  apis: string[];
  mcp: string[];
}

export default function Enhanced3DViewer({ owner, repo }: Enhanced3DViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<DeepAnalysisData | null>(null);
  const [integrations, setIntegrations] = useState<IntegrationData | null>(null);
  const [showControlPanel, setShowControlPanel] = useState(true);

  const [filters, setFilters] = useState<VisualizationFilters>({
    showFiles: true,
    showDirectories: true,
    showFunctions: true,
    showConnections: true,
    showAPIs: true,
    showImports: true,
    showExports: true
  });

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1a);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(15, 15, 15);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight1.position.set(10, 10, 10);
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0x4488ff, 0.4);
    directionalLight2.position.set(-10, -10, -10);
    scene.add(directionalLight2);

    // Grid helper
    const gridHelper = new THREE.GridHelper(30, 30, 0x444466, 0x222233);
    scene.add(gridHelper);

    // Fetch and visualize
    const fetchAndVisualize = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch deep analysis
        const analysisResponse = await fetch(`http://localhost:3001/api/repos/${owner}/${repo}/deep-analysis`);
        if (analysisResponse.ok) {
          const data = await analysisResponse.json();
          setAnalysisData(data);
        }

        // Fetch integrations
        const integrationsResponse = await fetch(`http://localhost:3001/api/repos/${owner}/${repo}/integrations`);
        if (integrationsResponse.ok) {
          const intData = await integrationsResponse.json();
          setIntegrations(intData);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching repository data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    };

    fetchAndVisualize();

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && containerRef.current.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [owner, repo]);

  // Re-render visualization when filters change
  useEffect(() => {
    if (!sceneRef.current || !analysisData) return;

    // Clear previous objects (except lights and grid)
    const objectsToRemove: THREE.Object3D[] = [];
    sceneRef.current.children.forEach(child => {
      if (child instanceof THREE.Mesh && !(child instanceof THREE.GridHelper)) {
        objectsToRemove.push(child);
      } else if (child instanceof THREE.Line) {
        objectsToRemove.push(child);
      } else if (child instanceof THREE.Group) {
        objectsToRemove.push(child);
      }
    });
    objectsToRemove.forEach(obj => sceneRef.current?.remove(obj));

    // Render based on filters
    renderVisualization(sceneRef.current, analysisData, filters);
  }, [filters, analysisData]);

  const toggleFilter = (filterName: keyof VisualizationFilters) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
          <div className="text-center">
            <div className="text-white text-2xl mb-4">Analyzing Repository...</div>
            <div className="text-gray-400 text-sm">
              Parsing functions, connections, APIs, and hierarchy
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute top-4 left-4 right-4 bg-red-900 border border-red-600 text-red-200 p-4 rounded-lg">
          <p className="font-semibold">Error</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Control Panel - Top Right */}
      <div className="absolute top-4 right-4 w-80">
        <div className="bg-gray-900 bg-opacity-95 border border-gray-700 rounded-lg shadow-xl">
          <div className="p-4 border-b border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">Visualization Controls</h3>
            <button
              onClick={() => setShowControlPanel(!showControlPanel)}
              className="text-gray-400 hover:text-white transition"
            >
              {showControlPanel ? '−' : '+'}
            </button>
          </div>

          {showControlPanel && (
            <div className="p-4 space-y-3">
              <div className="space-y-2">
                <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-800 p-2 rounded transition">
                  <input
                    type="checkbox"
                    checked={filters.showFiles}
                    onChange={() => toggleFilter('showFiles')}
                    className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-300">Files</span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-800 p-2 rounded transition">
                  <input
                    type="checkbox"
                    checked={filters.showDirectories}
                    onChange={() => toggleFilter('showDirectories')}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-300">Directories</span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-800 p-2 rounded transition">
                  <input
                    type="checkbox"
                    checked={filters.showFunctions}
                    onChange={() => toggleFilter('showFunctions')}
                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-300">Functions</span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-800 p-2 rounded transition">
                  <input
                    type="checkbox"
                    checked={filters.showConnections}
                    onChange={() => toggleFilter('showConnections')}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-300">File Connections</span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-800 p-2 rounded transition">
                  <input
                    type="checkbox"
                    checked={filters.showAPIs}
                    onChange={() => toggleFilter('showAPIs')}
                    className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-300">API Endpoints</span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-800 p-2 rounded transition">
                  <input
                    type="checkbox"
                    checked={filters.showImports}
                    onChange={() => toggleFilter('showImports')}
                    className="w-4 h-4 text-cyan-600 rounded focus:ring-cyan-500"
                  />
                  <span className="text-sm text-gray-300">Import Links</span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-800 p-2 rounded transition">
                  <input
                    type="checkbox"
                    checked={filters.showExports}
                    onChange={() => toggleFilter('showExports')}
                    className="w-4 h-4 text-yellow-600 rounded focus:ring-yellow-500"
                  />
                  <span className="text-sm text-gray-300">Export Links</span>
                </label>
              </div>

              {/* Stats */}
              {analysisData && (
                <div className="pt-3 border-t border-gray-700 space-y-1 text-xs text-gray-400">
                  <div className="flex justify-between">
                    <span>Functions:</span>
                    <span className="text-green-400">{analysisData.functions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Connections:</span>
                    <span className="text-purple-400">{analysisData.connections.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>APIs:</span>
                    <span className="text-red-400">{analysisData.apis.length}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Integrations Panel */}
        {integrations && (integrations.slack || integrations.jira || integrations.database.length > 0 || integrations.apis.length > 0 || integrations.mcp.length > 0) && (
          <div className="mt-4 bg-gray-900 bg-opacity-95 border border-gray-700 rounded-lg shadow-xl p-4">
            <h4 className="text-sm font-semibold text-white mb-3">Detected Integrations</h4>
            <div className="space-y-2 text-xs">
              {integrations.slack && (
                <div className="flex items-center space-x-2 text-purple-400">
                  <span>✓</span>
                  <span>Slack</span>
                </div>
              )}
              {integrations.jira && (
                <div className="flex items-center space-x-2 text-blue-400">
                  <span>✓</span>
                  <span>Jira</span>
                </div>
              )}
              {integrations.database.map((db, i) => (
                <div key={i} className="flex items-center space-x-2 text-green-400">
                  <span>✓</span>
                  <span>{db}</span>
                </div>
              ))}
              {integrations.mcp.map((mcp, i) => (
                <div key={i} className="flex items-center space-x-2 text-orange-400">
                  <span>✓</span>
                  <span>{mcp}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Controls Info - Bottom Left */}
      <div className="absolute bottom-4 left-4 bg-gray-800 bg-opacity-90 p-3 rounded-lg text-sm">
        <p className="text-gray-300 mb-2 font-semibold">Controls:</p>
        <ul className="text-gray-400 space-y-1 text-xs">
          <li>🖱️ Left click + drag: Rotate</li>
          <li>🖱️ Right click + drag: Pan</li>
          <li>🖱️ Scroll: Zoom</li>
        </ul>
      </div>
    </div>
  );
}

function renderVisualization(
  scene: THREE.Scene,
  data: DeepAnalysisData,
  filters: VisualizationFilters
) {
  const filePositions = new Map<string, THREE.Vector3>();

  // Render file hierarchy
  if (filters.showDirectories || filters.showFiles) {
    renderFileHierarchy(scene, data.hierarchy, filePositions, filters);
  }

  // Render functions
  if (filters.showFunctions && data.functions.length > 0) {
    renderFunctions(scene, data.functions, filePositions);
  }

  // Render connections
  if (filters.showConnections && data.connections.length > 0) {
    renderConnections(scene, data.connections, filePositions);
  }

  // Render APIs
  if (filters.showAPIs && data.apis.length > 0) {
    renderAPIs(scene, data.apis, filePositions);
  }
}

function renderFileHierarchy(
  scene: THREE.Scene,
  hierarchy: any[],
  filePositions: Map<string, THREE.Vector3>,
  filters: VisualizationFilters,
  baseX: number = 0,
  baseZ: number = 0,
  depth: number = 0
) {
  const spacing = 3;
  const depthOffset = 2;

  hierarchy.forEach((node, index) => {
    const x = baseX + (index % 5) * spacing;
    const z = baseZ + Math.floor(index / 5) * spacing;
    const y = depth * depthOffset;

    const position = new THREE.Vector3(x, y, z);
    filePositions.set(node.path, position);

    if (node.type === 'directory' && filters.showDirectories) {
      const geometry = new THREE.SphereGeometry(0.5, 16, 16);
      const material = new THREE.MeshPhongMaterial({
        color: 0xff6b35,
        emissive: 0xff6b35,
        emissiveIntensity: 0.3
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(position);
      scene.add(mesh);
    } else if (node.type === 'file' && filters.showFiles) {
      const geometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
      const color = getFileColor(node.path);
      const material = new THREE.MeshPhongMaterial({ color });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(position);
      scene.add(mesh);
    }

    // Recursively render children
    if (node.children && node.children.length > 0) {
      renderFileHierarchy(scene, node.children, filePositions, filters, x, z + spacing, depth + 1);
    }
  });
}

function renderFunctions(
  scene: THREE.Scene,
  functions: any[],
  filePositions: Map<string, THREE.Vector3>
) {
  functions.forEach(func => {
    const filePos = filePositions.get(func.file);
    if (filePos) {
      const geometry = new THREE.SphereGeometry(0.15, 8, 8);
      const material = new THREE.MeshPhongMaterial({
        color: 0x00ff88,
        emissive: 0x00ff88,
        emissiveIntensity: 0.5
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(
        filePos.x + (Math.random() - 0.5) * 0.6,
        filePos.y + 0.5,
        filePos.z + (Math.random() - 0.5) * 0.6
      );
      scene.add(mesh);
    }
  });
}

function renderConnections(
  scene: THREE.Scene,
  connections: any[],
  filePositions: Map<string, THREE.Vector3>
) {
  connections.forEach(conn => {
    const sourcePos = filePositions.get(conn.source);
    const targetPos = filePositions.get(conn.target);

    if (sourcePos && targetPos) {
      const points = [sourcePos, targetPos];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: 0x8844ff,
        opacity: 0.4,
        transparent: true
      });
      const line = new THREE.Line(geometry, material);
      scene.add(line);
    }
  });
}

function renderAPIs(
  scene: THREE.Scene,
  apis: any[],
  filePositions: Map<string, THREE.Vector3>
) {
  apis.forEach(api => {
    const filePos = filePositions.get(api.file);
    if (filePos) {
      const geometry = new THREE.ConeGeometry(0.2, 0.4, 6);
      const material = new THREE.MeshPhongMaterial({
        color: 0xff4444,
        emissive: 0xff4444,
        emissiveIntensity: 0.6
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(
        filePos.x,
        filePos.y + 0.8,
        filePos.z
      );
      scene.add(mesh);
    }
  });
}

function getFileColor(path: string): number {
  const ext = path.split('.').pop()?.toLowerCase();
  const colorMap: Record<string, number> = {
    js: 0xf7df1e,
    ts: 0x3178c6,
    tsx: 0x61dafb,
    jsx: 0x61dafb,
    py: 0x3776ab,
    java: 0xf89820,
    go: 0x00add8,
    rs: 0xdea584,
    cpp: 0x00599c,
    c: 0x555555,
    md: 0x083fa1,
    json: 0x292929,
    css: 0x264de4,
    html: 0xe34c26,
  };
  return colorMap[ext || ''] || 0x888888;
}
