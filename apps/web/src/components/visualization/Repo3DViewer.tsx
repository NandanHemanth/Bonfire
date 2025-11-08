import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import ReactMarkdown from 'react-markdown';

interface Repo3DViewerProps {
  owner: string;
  repo: string;
}

interface LegendData {
  owner: string;
  repo: string;
  totalFiles: number;
  legend: string;
  fileTree: string;
  timestamp: string;
}

export default function Repo3DViewer({ owner, repo }: Repo3DViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [legendData, setLegendData] = useState<LegendData | null>(null);
  const [loadingLegend, setLoadingLegend] = useState(false);
  const [showLegend, setShowLegend] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(5, 5, 5);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // Grid helper
    const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
    scene.add(gridHelper);

    // Fetch repository data and create visualization
    const fetchAndVisualize = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`http://localhost:3001/api/repos/${owner}/${repo}`);

        if (!response.ok) {
          throw new Error('Failed to fetch repository data');
        }

        const data = await response.json();

        // Create visualization from repository structure
        createVisualizationFromData(scene, data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching repository:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');

        // Create demo visualization even if API fails
        createDemoVisualization(scene);
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
      containerRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [owner, repo]);

  // Fetch legend data
  const fetchLegend = async () => {
    setLoadingLegend(true);
    try {
      const response = await fetch(`http://localhost:3001/api/repos/${owner}/${repo}/legend`);
      if (response.ok) {
        const data = await response.json();
        setLegendData(data);
        setShowLegend(true);
      }
    } catch (err) {
      console.error('Failed to fetch legend:', err);
    } finally {
      setLoadingLegend(false);
    }
  };

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-white text-xl">Loading 3D visualization...</div>
        </div>
      )}

      {error && (
        <div className="absolute top-4 left-4 right-4 bg-yellow-900 border border-yellow-600 text-yellow-200 p-4 rounded">
          <p className="font-semibold">Note: Using demo visualization</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Legend Panel */}
      {showLegend && legendData && (
        <div className="absolute top-4 right-4 w-96 max-h-[80vh] overflow-y-auto bg-gray-900 bg-opacity-95 border border-gray-700 rounded-lg shadow-xl">
          <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-4 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">Repository Legend</h3>
            <button
              onClick={() => setShowLegend(false)}
              className="text-gray-400 hover:text-white transition"
            >
              ✕
            </button>
          </div>
          <div className="p-4 text-sm prose prose-invert prose-sm max-w-none">
            <ReactMarkdown>{legendData.legend}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* Controls Panel */}
      <div className="absolute bottom-4 left-4 bg-gray-800 bg-opacity-90 p-3 rounded text-sm">
        <p className="text-gray-300 mb-2"><strong>Controls:</strong></p>
        <ul className="text-gray-400 space-y-1 text-xs">
          <li>🖱️ Left click + drag: Rotate</li>
          <li>🖱️ Right click + drag: Pan</li>
          <li>🖱️ Scroll: Zoom</li>
        </ul>
      </div>

      {/* Legend Button */}
      <div className="absolute bottom-4 right-4">
        <button
          onClick={fetchLegend}
          disabled={loadingLegend}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg shadow-lg transition disabled:opacity-50"
        >
          {loadingLegend ? '🔄 Generating...' : '📋 Show Legend'}
        </button>
      </div>
    </div>
  );
}

// Create visualization from actual repository data
function createVisualizationFromData(scene: THREE.Scene, data: any) {
  const files = data.structure || [];

  // Group files by directory
  const directories = new Map<string, any[]>();

  files.forEach((file: any) => {
    if (file.type === 'blob') {
      const parts = file.path.split('/');
      const dir = parts.length > 1 ? parts[0] : 'root';

      if (!directories.has(dir)) {
        directories.set(dir, []);
      }
      directories.get(dir)?.push(file);
    }
  });

  // Create clusters for each directory
  let angleOffset = 0;
  const radius = 8;

  directories.forEach((dirFiles, dirName) => {
    const dirGroup = new THREE.Group();

    // Create directory sphere
    const dirGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const dirMaterial = new THREE.MeshPhongMaterial({
      color: 0xff6b35,
      emissive: 0xff6b35,
      emissiveIntensity: 0.2,
    });
    const dirMesh = new THREE.Mesh(dirGeometry, dirMaterial);

    // Position directory
    const angle = angleOffset;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    dirMesh.position.set(x, 0, z);
    dirGroup.add(dirMesh);

    // Create files around directory
    dirFiles.slice(0, 10).forEach((file, index) => {
      const fileGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
      const fileColor = getFileColor(file.path);
      const fileMaterial = new THREE.MeshPhongMaterial({ color: fileColor });
      const fileMesh = new THREE.Mesh(fileGeometry, fileMaterial);

      const fileAngle = (index / dirFiles.length) * Math.PI * 2;
      const fileRadius = 1.5;
      const fx = x + Math.cos(fileAngle) * fileRadius;
      const fy = Math.sin(fileAngle) * 0.5;
      const fz = z + Math.sin(fileAngle) * fileRadius;

      fileMesh.position.set(fx, fy, fz);
      dirGroup.add(fileMesh);

      // Connect file to directory
      const points = [
        new THREE.Vector3(x, 0, z),
        new THREE.Vector3(fx, fy, fz),
      ];
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0x444444 });
      const line = new THREE.Line(lineGeometry, lineMaterial);
      dirGroup.add(line);
    });

    scene.add(dirGroup);
    angleOffset += (Math.PI * 2) / directories.size;
  });

  // Add central repository node
  const repoGeometry = new THREE.SphereGeometry(1, 64, 64);
  const repoMaterial = new THREE.MeshPhongMaterial({
    color: 0xf4a259,
    emissive: 0xf4a259,
    emissiveIntensity: 0.3,
  });
  const repoMesh = new THREE.Mesh(repoGeometry, repoMaterial);
  scene.add(repoMesh);
}

// Create demo visualization
function createDemoVisualization(scene: THREE.Scene) {
  // Central repository node
  const repoGeometry = new THREE.SphereGeometry(1, 64, 64);
  const repoMaterial = new THREE.MeshPhongMaterial({
    color: 0xf4a259,
    emissive: 0xf4a259,
    emissiveIntensity: 0.3,
  });
  const repoMesh = new THREE.Mesh(repoGeometry, repoMaterial);
  scene.add(repoMesh);

  // Demo directories
  const demoDirectories = [
    { name: 'src', files: 15, color: 0x4ecdc4 },
    { name: 'tests', files: 8, color: 0x95e1d3 },
    { name: 'docs', files: 5, color: 0xf38181 },
    { name: 'config', files: 3, color: 0xaa96da },
  ];

  demoDirectories.forEach((dir, dirIndex) => {
    const angle = (dirIndex / demoDirectories.length) * Math.PI * 2;
    const radius = 5;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    // Directory node
    const dirGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const dirMaterial = new THREE.MeshPhongMaterial({
      color: dir.color,
      emissive: dir.color,
      emissiveIntensity: 0.2,
    });
    const dirMesh = new THREE.Mesh(dirGeometry, dirMaterial);
    dirMesh.position.set(x, 0, z);
    scene.add(dirMesh);

    // Connect to center
    const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(x, 0, z)];
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x444444 });
    const line = new THREE.Line(lineGeometry, lineMaterial);
    scene.add(line);

    // Files
    for (let i = 0; i < dir.files; i++) {
      const fileAngle = (i / dir.files) * Math.PI * 2;
      const fileRadius = 1.5;
      const fx = x + Math.cos(fileAngle) * fileRadius;
      const fy = Math.sin(fileAngle) * 0.5;
      const fz = z + Math.sin(fileAngle) * fileRadius;

      const fileGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
      const fileMaterial = new THREE.MeshPhongMaterial({ color: dir.color });
      const fileMesh = new THREE.Mesh(fileGeometry, fileMaterial);
      fileMesh.position.set(fx, fy, fz);
      scene.add(fileMesh);

      // Connect file to directory
      const filePoints = [new THREE.Vector3(x, 0, z), new THREE.Vector3(fx, fy, fz)];
      const fileLineGeometry = new THREE.BufferGeometry().setFromPoints(filePoints);
      const fileLineMaterial = new THREE.LineBasicMaterial({ color: 0x333333 });
      const fileLine = new THREE.Line(fileLineGeometry, fileLineMaterial);
      scene.add(fileLine);
    }
  });
}

// Get file color based on extension
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

