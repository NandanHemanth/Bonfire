import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface CleanVisualizationProps {
  owner: string;
  repo: string;
}

interface VisualizationFilters {
  showFiles: boolean;
  showDirectories: boolean;
  showFunctions: boolean;
  showConnections: boolean;
  showAPIs: boolean;
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
}

interface IntegrationData {
  slack: boolean;
  jira: boolean;
  database: string[];
  apis: string[];
  mcp: string[];
}

interface LegendData {
  owner: string;
  repo: string;
  totalFiles: number;
  legend: string;
  fileTree: string;
  timestamp: string;
}

interface HoveredFile {
  path: string;
  functions: Array<{ name: string; line: number; type: string }>;
  apis: Array<{ method: string; path: string; line: number }>;
  position: { x: number; y: number };
}

export default function CleanVisualization({ owner, repo }: CleanVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const cameraRef = useRef<THREE.Camera | null>(null);
  const meshMapRef = useRef<Map<THREE.Mesh, any>>(new Map());

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<DeepAnalysisData | null>(null);
  const [integrations, setIntegrations] = useState<IntegrationData | null>(null);
  const [hoveredFile, setHoveredFile] = useState<HoveredFile | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const [filters, setFilters] = useState<VisualizationFilters>({
    showFiles: true,
    showDirectories: true,
    showFunctions: true,
    showConnections: true,
    showAPIs: true
  });

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup with light background
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5); // Light gray/white canvas
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 20, 30);
    cameraRef.current = camera;

    // Renderer with antialiasing for clean lines
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    // Controls - Left drag to pan, scroll to zoom
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 5;
    controls.maxDistance = 150;
    controls.enablePan = true; // Enable panning
    controls.enableRotate = false; // Disable rotation
    controls.enableZoom = true; // Enable zoom with mouse wheel
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.PAN,    // Left mouse: Pan (move through space)
      MIDDLE: THREE.MOUSE.DOLLY, // Middle mouse: Zoom
      RIGHT: THREE.MOUSE.PAN     // Right mouse: Also pan
    };
    controls.screenSpacePanning = true; // Pan in screen space for more intuitive movement

    // Lighting for clean shadows
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Grid dots instead of lines
    const dotGeometry = new THREE.BufferGeometry();
    const dotPositions: number[] = [];
    const gridSize = 50;
    const gridSpacing = 1;

    for (let x = -gridSize / 2; x <= gridSize / 2; x += gridSpacing) {
      for (let z = -gridSize / 2; z <= gridSize / 2; z += gridSpacing) {
        dotPositions.push(x, 0, z);
      }
    }

    dotGeometry.setAttribute('position', new THREE.Float32BufferAttribute(dotPositions, 3));
    const dotMaterial = new THREE.PointsMaterial({
      color: 0xd1d5db, // Light gray
      size: 0.05,
      sizeAttenuation: true
    });
    const dots = new THREE.Points(dotGeometry, dotMaterial);
    scene.add(dots);

    // Mouse move handler for hover
    const handleMouseMove = (event: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      setMousePosition({ x: event.clientX, y: event.clientY });

      // Raycast for hover detection
      if (cameraRef.current && sceneRef.current) {
        raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
        const intersects = raycasterRef.current.intersectObjects(sceneRef.current.children, true);

        // Reset all emissive colors first
        meshMapRef.current.forEach((data, mesh) => {
          if (mesh.material instanceof THREE.MeshStandardMaterial) {
            mesh.material.emissive.setHex(0x000000);
            mesh.material.emissiveIntensity = 0;
          }
        });

        if (intersects.length > 0) {
          const mesh = intersects[0].object as THREE.Mesh;
          const fileData = meshMapRef.current.get(mesh);

          if (fileData) {
            console.log('Hovering over:', fileData.path, 'Functions:', fileData.functions?.length || 0, 'APIs:', fileData.apis?.length || 0);
            setHoveredFile({
              path: fileData.path,
              functions: fileData.functions || [],
              apis: fileData.apis || [],
              position: { x: event.clientX, y: event.clientY }
            });

            // Highlight hovered mesh
            if (mesh.material instanceof THREE.MeshStandardMaterial) {
              mesh.material.emissive.setHex(0x3b82f6);
              mesh.material.emissiveIntensity = 0.3;
            }
          } else {
            setHoveredFile(null);
          }
        } else {
          setHoveredFile(null);
        }
      }
    };

    renderer.domElement.addEventListener('mousemove', handleMouseMove);

    // Fetch and visualize
    const fetchAndVisualize = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log(`=== Fetching data for ${owner}/${repo} ===`);
        const analysisResponse = await fetch(`http://localhost:3001/api/repos/${owner}/${repo}/deep-analysis`);
        console.log('Analysis response status:', analysisResponse.status);

        if (analysisResponse.ok) {
          const data = await analysisResponse.json();
          console.log('Analysis data received:', {
            functions: data.functions?.length || 0,
            connections: data.connections?.length || 0,
            apis: data.apis?.length || 0,
            hierarchy: data.hierarchy?.length || 0
          });
          console.log('Sample hierarchy data:', data.hierarchy?.slice(0, 2));
          setAnalysisData(data);
        } else {
          console.error('Analysis response not OK:', analysisResponse.statusText);
        }

        const integrationsResponse = await fetch(`http://localhost:3001/api/repos/${owner}/${repo}/integrations`);
        console.log('Integrations response status:', integrationsResponse.status);

        if (integrationsResponse.ok) {
          const intData = await integrationsResponse.json();
          console.log('Integrations data:', intData);
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
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      if (containerRef.current && containerRef.current.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [owner, repo]);

  // Re-render when filters or data change
  useEffect(() => {
    if (!sceneRef.current || !analysisData) {
      console.log('=== CleanVisualization: Cannot render ===');
      console.log('sceneRef:', !!sceneRef.current);
      console.log('analysisData:', !!analysisData);
      return;
    }

    console.log('=== CleanVisualization: Rendering ===');
    console.log('Hierarchy:', analysisData.hierarchy?.length || 0, 'items');
    console.log('Functions:', analysisData.functions?.length || 0);
    console.log('Connections:', analysisData.connections?.length || 0);
    console.log('APIs:', analysisData.apis?.length || 0);
    console.log('Filters:', filters);

    // Clear previous objects (but keep lights, dots, and grid)
    const objectsToRemove: THREE.Object3D[] = [];
    sceneRef.current.children.forEach(child => {
      if (child instanceof THREE.Mesh || child instanceof THREE.Line || child instanceof THREE.Group) {
        // Don't remove lights, points (dots), or grid helpers
        if (child.type !== 'Light' && !(child instanceof THREE.Points)) {
          objectsToRemove.push(child);
        }
      }
    });
    objectsToRemove.forEach(obj => sceneRef.current?.remove(obj));
    meshMapRef.current.clear();

    // Add test cube to verify rendering works
    const testGeo = new THREE.BoxGeometry(2, 2, 2);
    const testMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const testMesh = new THREE.Mesh(testGeo, testMat);
    testMesh.position.set(0, 1, 0);
    sceneRef.current.add(testMesh);
    console.log('✅ Test cube added at (0, 1, 0)');

    // Add test connection tube to verify tube rendering
    const testCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-5, 1, 0),
      new THREE.Vector3(0, 3, 0),
      new THREE.Vector3(5, 1, 0)
    );
    const testTubeGeo = new THREE.TubeGeometry(testCurve, 50, 0.08, 8, false);
    const testTubeMat = new THREE.MeshStandardMaterial({
      color: 0x0066ff,
      emissive: 0x0066ff,
      emissiveIntensity: 0.2
    });
    const testTube = new THREE.Mesh(testTubeGeo, testTubeMat);
    sceneRef.current.add(testTube);
    console.log('✅ Test BLUE tube connection added from (-5,1,0) to (5,1,0)');

    // Add test API marker
    const testApiGeo = new THREE.CylinderGeometry(0.3, 0.3, 1.2, 8);
    const testApiMat = new THREE.MeshStandardMaterial({
      color: 0xff6600,
      emissive: 0xff6600,
      emissiveIntensity: 0.3
    });
    const testApiMesh = new THREE.Mesh(testApiGeo, testApiMat);
    testApiMesh.position.set(0, 2, 5);
    sceneRef.current.add(testApiMesh);
    console.log('✅ Test ORANGE API marker added at (0,2,5)');

    // Render visualization
    renderCleanVisualization(sceneRef.current, analysisData, filters, meshMapRef.current);

    console.log('Total scene children after render:', sceneRef.current.children.length);
  }, [filters, analysisData]);

  const toggleFilter = (filterName: keyof VisualizationFilters) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };

  return (
    <div className="relative w-full h-full bg-gray-50">
      <div ref={containerRef} className="w-full h-full" />

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90">
          <div className="text-center">
            <div className="text-gray-800 text-2xl mb-4 font-semibold">Analyzing Repository...</div>
            <div className="text-gray-600 text-sm">
              Parsing functions, connections, APIs, and hierarchy
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute top-4 left-4 right-4 bg-red-50 border border-red-300 text-red-800 p-4 rounded-lg shadow">
          <p className="font-semibold">Error</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Clean Control Panel - Top Right */}
      <div className="absolute top-4 right-4 w-72 bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
        </div>

        <div className="p-4 space-y-2">
          <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition">
            <input
              type="checkbox"
              checked={filters.showFiles}
              onChange={() => toggleFilter('showFiles')}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 font-medium">Files</span>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition">
            <input
              type="checkbox"
              checked={filters.showDirectories}
              onChange={() => toggleFilter('showDirectories')}
              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700 font-medium">Directories</span>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition">
            <input
              type="checkbox"
              checked={filters.showFunctions}
              onChange={() => toggleFilter('showFunctions')}
              className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
            />
            <span className="text-sm text-gray-700 font-medium">Functions</span>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition">
            <input
              type="checkbox"
              checked={filters.showConnections}
              onChange={() => toggleFilter('showConnections')}
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700 font-medium">File Connections</span>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition">
            <input
              type="checkbox"
              checked={filters.showAPIs}
              onChange={() => toggleFilter('showAPIs')}
              className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
            />
            <span className="text-sm text-gray-700 font-medium">API Endpoints</span>
          </label>
        </div>

        {analysisData && (
          <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Functions:</span>
                <span className="font-semibold text-green-600">{analysisData.functions.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Connections:</span>
                <span className="font-semibold text-indigo-600">{analysisData.connections.length}</span>
              </div>
              <div className="flex justify-between">
                <span>APIs:</span>
                <span className="font-semibold text-orange-600">{analysisData.apis.length}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hover Tooltip */}
      {hoveredFile && (
        <div
          className="absolute z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-sm"
          style={{
            left: `${hoveredFile.position.x + 20}px`,
            top: `${hoveredFile.position.y - 20}px`,
            pointerEvents: 'none'
          }}
        >
          <div className="font-semibold text-gray-800 mb-2 text-sm border-b border-gray-200 pb-2">
            {hoveredFile.path.split('/').pop()}
          </div>

          {hoveredFile.functions.length > 0 && (
            <div className="mb-2">
              <div className="text-xs font-semibold text-green-600 mb-1">Functions:</div>
              <div className="space-y-1">
                {hoveredFile.functions.slice(0, 5).map((func, i) => (
                  <div key={i} className="text-xs text-gray-600 pl-2">
                    • {func.name} <span className="text-gray-400">(line {func.line})</span>
                  </div>
                ))}
                {hoveredFile.functions.length > 5 && (
                  <div className="text-xs text-gray-400 pl-2">
                    ...and {hoveredFile.functions.length - 5} more
                  </div>
                )}
              </div>
            </div>
          )}

          {hoveredFile.apis.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-orange-600 mb-1">APIs:</div>
              <div className="space-y-1">
                {hoveredFile.apis.map((api, i) => (
                  <div key={i} className="text-xs text-gray-600 pl-2">
                    • <span className="font-mono">{api.method}</span> {api.path}
                  </div>
                ))}
              </div>
            </div>
          )}

          {hoveredFile.functions.length === 0 && hoveredFile.apis.length === 0 && (
            <div className="text-xs text-gray-400">No functions or APIs detected</div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        <div className="text-sm font-semibold text-gray-800 mb-3">Legend</div>
        <div className="space-y-2 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#0066ff' }}></div>
            <span className="text-gray-700">File Connections (Imports/Exports)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ff6600' }}></div>
            <span className="text-gray-700">API Endpoints (REST/GraphQL)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 border-2 border-gray-400 bg-white rounded-full"></div>
            <span className="text-gray-700">One-way connection →</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 border-2 border-gray-400 bg-white rounded-full"></div>
            <span className="text-gray-700">Two-way connection ↔</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-3 text-xs">
        <div className="text-gray-800 font-semibold mb-2">Controls</div>
        <div className="space-y-1 text-gray-600">
          <div>Left/Right drag: Move through space</div>
          <div>Scroll: Zoom in/out</div>
          <div>Hover: View file details</div>
        </div>
      </div>
    </div>
  );
}

function renderCleanVisualization(
  scene: THREE.Scene,
  data: DeepAnalysisData,
  filters: VisualizationFilters,
  meshMap: Map<THREE.Mesh, any>
) {
  console.log('=== renderCleanVisualization called ===');
  const filePositions = new Map<string, THREE.Vector3>();
  const fileDataMap = new Map<string, any>();

  // Group functions and APIs by file
  data.functions.forEach(func => {
    if (!fileDataMap.has(func.file)) {
      fileDataMap.set(func.file, { functions: [], apis: [] });
    }
    fileDataMap.get(func.file).functions.push(func);
  });

  data.apis.forEach(api => {
    if (!fileDataMap.has(api.file)) {
      fileDataMap.set(api.file, { functions: [], apis: [] });
    }
    fileDataMap.get(api.file).apis.push(api);
  });

  console.log('Files with data:', fileDataMap.size);

  // Render hierarchy as 2D canvas with 3D depth
  if (filters.showDirectories || filters.showFiles) {
    console.log('Rendering hierarchy...', data.hierarchy?.length || 0, 'root nodes');
    renderCleanHierarchy(scene, data.hierarchy, filePositions, fileDataMap, filters, meshMap);
    console.log('File positions after hierarchy:', filePositions.size);
  } else {
    console.log('Skipping hierarchy (filters disabled)');
  }

  // Render connections with direction indicators - BRIGHT BLUE
  if (filters.showConnections && data.connections.length > 0) {
    console.log('Rendering connections:', data.connections.length);
    renderDirectionalConnections(scene, data.connections, filePositions, 0x0066ff); // Bright Blue
  }

  // Render API connections - BRIGHT ORANGE
  if (filters.showAPIs && data.apis.length > 0) {
    console.log('Rendering API markers:', data.apis.length);
    renderAPIMarkers(scene, data.apis, filePositions, 0xff6600); // Bright Orange
  }
}

function renderCleanHierarchy(
  scene: THREE.Scene,
  hierarchy: any[],
  filePositions: Map<string, THREE.Vector3>,
  fileDataMap: Map<string, any>,
  filters: VisualizationFilters,
  meshMap: Map<THREE.Mesh, any>,
  baseX: number = 0,
  baseZ: number = 0,
  depth: number = 0
) {
  if (!hierarchy || hierarchy.length === 0) {
    console.log('⚠️ renderCleanHierarchy: No hierarchy data');
    return;
  }

  console.log(`renderCleanHierarchy: Processing ${hierarchy.length} nodes at depth ${depth}`);
  const spacing = 4;
  const depthOffset = 3;

  hierarchy.forEach((node, index) => {
    const x = baseX + (index % 6) * spacing;
    const z = baseZ + Math.floor(index / 6) * spacing;
    const y = depth * depthOffset;

    const position = new THREE.Vector3(x, y, z);
    filePositions.set(node.path, position);
    console.log(`  Node: ${node.path} (type: ${node.type}) at (${x.toFixed(1)}, ${y.toFixed(1)}, ${z.toFixed(1)})`)

    if (node.type === 'directory' && filters.showDirectories) {
      // Clean directory representation - translucent cube
      const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
      const material = new THREE.MeshStandardMaterial({
        color: 0x8b5cf6, // Purple
        transparent: true,
        opacity: 0.6,
        metalness: 0.1,
        roughness: 0.4
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(position);
      mesh.castShadow = true;
      scene.add(mesh);
      console.log(`    ✅ Added directory mesh for ${node.path}`);

      const fileData = fileDataMap.get(node.path) || { functions: [], apis: [] };
      meshMap.set(mesh, { path: node.path, ...fileData });

    } else if (node.type === 'file' && filters.showFiles) {
      // Clean file representation - solid rounded box
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const color = getCleanFileColor(node.path);
      const material = new THREE.MeshStandardMaterial({
        color,
        metalness: 0.2,
        roughness: 0.5
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(position);
      mesh.castShadow = true;
      scene.add(mesh);
      console.log(`    ✅ Added file mesh for ${node.path} (color: ${color.toString(16)})`);

      const fileData = fileDataMap.get(node.path) || { functions: [], apis: [] };
      meshMap.set(mesh, { path: node.path, ...fileData });

      // Add function indicators if present
      if (filters.showFunctions && fileData.functions.length > 0) {
        const funcGeometry = new THREE.SphereGeometry(0.15, 8, 8);
        const funcMaterial = new THREE.MeshStandardMaterial({
          color: 0x10b981, // Green
          metalness: 0.3,
          roughness: 0.4
        });
        const funcMesh = new THREE.Mesh(funcGeometry, funcMaterial);
        funcMesh.position.set(x, y + 0.7, z);
        scene.add(funcMesh);
        console.log(`      ✅ Added ${fileData.functions.length} function indicator(s)`);
      }
    }

    // Recursively render children
    if (node.children && node.children.length > 0) {
      renderCleanHierarchy(scene, node.children, filePositions, fileDataMap, filters, meshMap, x, z + spacing, depth + 1);
    }
  });
}

function renderDirectionalConnections(
  scene: THREE.Scene,
  connections: any[],
  filePositions: Map<string, THREE.Vector3>,
  color: number
) {
  // Group connections to detect two-way relationships
  const connectionPairs = new Map<string, { targets: Set<string>; sources: Set<string> }>();

  connections.forEach(conn => {
    if (!connectionPairs.has(conn.source)) {
      connectionPairs.set(conn.source, { targets: new Set(), sources: new Set() });
    }
    connectionPairs.get(conn.source)!.targets.add(conn.target);

    if (!connectionPairs.has(conn.target)) {
      connectionPairs.set(conn.target, { targets: new Set(), sources: new Set() });
    }
    connectionPairs.get(conn.target)!.sources.add(conn.source);
  });

  const drawnConnections = new Set<string>();

  connections.forEach(conn => {
    const sourcePos = filePositions.get(conn.source);
    const targetPos = filePositions.get(conn.target);

    if (sourcePos && targetPos) {
      const connectionKey = [conn.source, conn.target].sort().join('->');
      if (drawnConnections.has(connectionKey)) return;
      drawnConnections.add(connectionKey);

      // Check if two-way
      const isTwoWay = connectionPairs.get(conn.target)?.targets.has(conn.source) || false;

      // Create curved tube (much more visible than lines)
      const curve = new THREE.QuadraticBezierCurve3(
        sourcePos,
        new THREE.Vector3(
          (sourcePos.x + targetPos.x) / 2,
          Math.max(sourcePos.y, targetPos.y) + 2,
          (sourcePos.z + targetPos.z) / 2
        ),
        targetPos
      );

      const points = curve.getPoints(50);

      // Create tube geometry for thick, visible connections
      const tubeGeometry = new THREE.TubeGeometry(curve, 50, 0.08, 8, false);
      const tubeMaterial = new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.2,
        metalness: 0.3,
        roughness: 0.4
      });

      const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
      scene.add(tube);
      console.log(`  ✅ Added THICK connection tube from ${conn.source} to ${conn.target} (${isTwoWay ? 'two-way' : 'one-way'})`);

      // Add arrow for direction
      if (!isTwoWay) {
        addArrowHead(scene, points[points.length - 5], targetPos, color);
      } else {
        // Add arrows on both ends for two-way
        addArrowHead(scene, points[points.length - 5], targetPos, color);
        addArrowHead(scene, points[5], sourcePos, color);
      }
    }
  });
}

function addArrowHead(scene: THREE.Scene, fromPos: THREE.Vector3, toPos: THREE.Vector3, color: number) {
  const direction = new THREE.Vector3().subVectors(toPos, fromPos).normalize();
  const arrowGeometry = new THREE.ConeGeometry(0.2, 0.5, 8);
  const arrowMaterial = new THREE.MeshStandardMaterial({
    color: color,
    emissive: color,
    emissiveIntensity: 0.3
  });
  const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);

  arrow.position.copy(toPos);
  arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);

  scene.add(arrow);
}

function renderAPIMarkers(
  scene: THREE.Scene,
  apis: any[],
  filePositions: Map<string, THREE.Vector3>,
  color: number
) {
  console.log(`renderAPIMarkers: Processing ${apis.length} API endpoints`);
  apis.forEach(api => {
    const filePos = filePositions.get(api.file);
    if (filePos) {
      // Larger, more visible API markers
      const geometry = new THREE.CylinderGeometry(0.3, 0.3, 1.2, 8);
      const material = new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.3,
        metalness: 0.3,
        roughness: 0.4
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(filePos.x, filePos.y + 1.5, filePos.z);
      scene.add(mesh);
      console.log(`  ✅ Added BRIGHT API marker for ${api.method} ${api.path} at ${api.file}`);
    } else {
      console.log(`  ⚠️ No position found for API file: ${api.file}`);
    }
  });
}

function getCleanFileColor(path: string): number {
  const ext = path.split('.').pop()?.toLowerCase();
  const colorMap: Record<string, number> = {
    js: 0xfbbf24,   // Amber
    ts: 0x3b82f6,   // Blue
    tsx: 0x06b6d4,  // Cyan
    jsx: 0x06b6d4,  // Cyan
    py: 0x0ea5e9,   // Sky blue
    java: 0xef4444, // Red
    go: 0x0891b2,   // Cyan
    rs: 0xf97316,   // Orange
    cpp: 0x6366f1,  // Indigo
    c: 0x64748b,    // Slate
    md: 0x8b5cf6,   // Purple
    json: 0x71717a, // Gray
    css: 0x8b5cf6,  // Purple
    html: 0xf97316, // Orange
  };
  return colorMap[ext || ''] || 0x94a3b8; // Default gray
}
