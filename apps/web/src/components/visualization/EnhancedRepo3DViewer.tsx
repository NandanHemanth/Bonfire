import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface EnhancedRepo3DViewerProps {
  owner: string;
  repo: string;
  role?: string;
}

interface FileAnalysis {
  path: string;
  functions: Array<{
    name: string;
    line: number;
    params?: string[];
    description?: string;
  }>;
  imports: string[];
  exports: string[];
  apiCalls: Array<{
    method: string;
    endpoint: string;
    line: number;
    type: string;
  }>;
  linesOfCode: number;
  language: string;
  status: 'new' | 'modified' | 'deleted' | 'unchanged';
}

interface FileConnection {
  source: string;
  target: string;
  type: string;
}

interface RepositoryAnalysis {
  owner: string;
  repo: string;
  files: FileAnalysis[];
  connections: FileConnection[];
  apiEndpoints: any[];
  timestamp: string;
  stats: {
    totalFiles: number;
    totalFunctions: number;
    totalConnections: number;
    totalAPIs: number;
  };
}

export default function EnhancedRepo3DViewer({ owner, repo, role = 'developer' }: EnhancedRepo3DViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<RepositoryAnalysis | null>(null);
  const [hoveredFile, setHoveredFile] = useState<FileAnalysis | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const meshToFileMap = useRef<Map<THREE.Mesh, FileAnalysis>>(new Map());

  // Only show for developer role
  if (role !== 'developer') {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400">This view is only available for Developer role</p>
      </div>
    );
  }

  // Fetch analysis on mount
  useEffect(() => {
    loadAnalysis();
  }, [owner, repo]);

  const loadAnalysis = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/repos/${owner}/${repo}/analysis`);

      if (response.ok) {
        const data = await response.json();
        setAnalysis(data);
      } else {
        setError('No analysis found. Click Sync to analyze this repository.');
      }
    } catch (err) {
      console.error('Failed to load analysis:', err);
      setError('Failed to load analysis');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      setError(null);

      const response = await fetch(`http://localhost:3001/api/repos/${owner}/${repo}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branch: 'main' })
      });

      if (!response.ok) {
        throw new Error('Failed to start sync');
      }

      // Poll for sync status
      const pollInterval = setInterval(async () => {
        const statusResponse = await fetch(`http://localhost:3001/api/repos/${owner}/${repo}/sync-status`);
        const status = await statusResponse.json();

        if (status.status === 'complete') {
          clearInterval(pollInterval);
          setSyncing(false);
          loadAnalysis();
        } else if (status.status === 'error') {
          clearInterval(pollInterval);
          setSyncing(false);
          setError(status.error || 'Sync failed');
        }
      }, 2000);

      // Stop polling after 5 minutes
      setTimeout(() => clearInterval(pollInterval), 5 * 60 * 1000);
    } catch (err) {
      console.error('Sync error:', err);
      setError('Failed to sync repository');
      setSyncing(false);
    }
  };

  // Setup 3D scene
  useEffect(() => {
    if (!containerRef.current || !analysis) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff); // White background
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(15, 15, 15);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    rendererRef.current = renderer;
    containerRef.current.appendChild(renderer.domElement);

    // Controls - disable rotation, enable only panning and zooming
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableRotate = false; // Disable rotation
    controls.enablePan = true; // Enable panning (drag to move)
    controls.enableZoom = true; // Enable zoom with scroll
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.PAN, // Left click drag to pan (move)
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.PAN // Right click also pans
    };
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(20, 20, 20);
    scene.add(directionalLight);

    // Create visualization
    createEnhancedVisualization(scene, analysis);

    // Mouse move handler for hover
    const handleMouseMove = (event: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      setMousePosition({ x: event.clientX, y: event.clientY });

      // Raycast to detect hovered objects
      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        const mesh = intersects[0].object as THREE.Mesh;
        const fileData = meshToFileMap.current.get(mesh);
        if (fileData) {
          setHoveredFile(fileData);
          document.body.style.cursor = 'pointer';
          return;
        }
      }

      setHoveredFile(null);
      document.body.style.cursor = 'default';
    };

    renderer.domElement.addEventListener('mousemove', handleMouseMove);

    // Click handler for opening files in VSCode
    const handleClick = async (event: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Raycast to detect clicked objects
      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        const mesh = intersects[0].object as THREE.Mesh;
        const fileData = meshToFileMap.current.get(mesh);
        if (fileData) {
          // Open file in VSCode
          try {
            const response = await fetch(`http://localhost:3001/api/repos/open-in-vscode`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                owner: analysis?.owner,
                repo: analysis?.repo,
                filePath: fileData.path
              })
            });

            if (response.ok) {
              console.log(`Opening ${fileData.path} in VSCode`);
            }
          } catch (error) {
            console.error('Failed to open in VSCode:', error);
          }
        }
      }
    };

    renderer.domElement.addEventListener('click', handleClick);

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
      renderer.domElement.removeEventListener('click', handleClick);
      containerRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
      document.body.style.cursor = 'default';
    };
  }, [analysis]);

  const createEnhancedVisualization = (scene: THREE.Scene, data: RepositoryAnalysis) => {
    meshToFileMap.current.clear();

    // Group files by directory
    const directoryMap = new Map<string, FileAnalysis[]>();

    data.files.forEach(file => {
      const parts = file.path.split('/');
      const dir = parts.length > 1 ? parts[0] : 'root';

      if (!directoryMap.has(dir)) {
        directoryMap.set(dir, []);
      }
      directoryMap.get(dir)?.push(file);
    });

    // Create visualization
    let angleOffset = 0;
    const radius = 12;

    directoryMap.forEach((dirFiles, dirName) => {
      const angle = angleOffset;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      // Create translucent light blue folder/directory
      const dirGeometry = new THREE.BoxGeometry(2, 2, 2);
      const dirMaterial = new THREE.MeshPhongMaterial({
        color: 0x5dade2, // Light blue
        transparent: true,
        opacity: 0.4,
        emissive: 0x3498db,
        emissiveIntensity: 0.2
      });
      const dirMesh = new THREE.Mesh(dirGeometry, dirMaterial);
      dirMesh.position.set(x, 0, z);
      scene.add(dirMesh);

      // Add directory label
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      canvas.width = 256;
      canvas.height = 64;
      context.fillStyle = '#000000'; // Black text
      context.font = 'Bold 28px Arial'; // Bigger text
      context.fillText(dirName, 10, 40);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.set(x, 2, z);
      sprite.scale.set(4, 1, 1);
      scene.add(sprite);

      // Create files around directory
      dirFiles.forEach((file, index) => {
        const fileAngle = (index / dirFiles.length) * Math.PI * 2;
        const fileRadius = 4;
        const fx = x + Math.cos(fileAngle) * fileRadius;
        const fy = Math.sin(fileAngle) * 1.5;
        const fz = z + Math.sin(fileAngle) * fileRadius;

        // Create file mesh - thin blue rectangle
        const fileGeometry = new THREE.BoxGeometry(0.4, 0.8, 0.1); // Thin rectangular
        const fileMaterial = new THREE.MeshPhongMaterial({
          color: 0x4a90e2, // Blue
          emissive: 0x4a90e2,
          emissiveIntensity: 0.2
        });
        const fileMesh = new THREE.Mesh(fileGeometry, fileMaterial);
        fileMesh.position.set(fx, fy, fz);
        scene.add(fileMesh);

        // Store file data for hover
        meshToFileMap.current.set(fileMesh, file);

        // Create yellow balls for each function in the file
        file.functions.forEach((func, funcIdx) => {
          const funcAngle = (funcIdx / Math.max(file.functions.length, 1)) * Math.PI * 2;
          const funcRadius = 0.6;
          const funcX = fx + Math.cos(funcAngle) * funcRadius;
          const funcY = fy + Math.sin(funcAngle) * funcRadius;
          const funcZ = fz + Math.sin(funcAngle) * funcRadius;

          const funcGeometry = new THREE.SphereGeometry(0.15, 16, 16);
          const funcMaterial = new THREE.MeshPhongMaterial({
            color: 0xffff00, // Yellow
            emissive: 0xffff00,
            emissiveIntensity: 0.3
          });
          const funcMesh = new THREE.Mesh(funcGeometry, funcMaterial);
          funcMesh.position.set(funcX, funcY, funcZ);
          scene.add(funcMesh);

          // Connect function to file with black line
          const funcPoints = [
            new THREE.Vector3(fx, fy, fz),
            new THREE.Vector3(funcX, funcY, funcZ)
          ];
          const funcLineGeometry = new THREE.BufferGeometry().setFromPoints(funcPoints);
          const funcLineMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 1 });
          const funcLine = new THREE.Line(funcLineGeometry, funcLineMaterial);
          scene.add(funcLine);
        });

        // Create orange spheres for API endpoints
        file.apiCalls.forEach((api, apiIdx) => {
          const apiAngle = (apiIdx / Math.max(file.apiCalls.length, 1)) * Math.PI * 2 + Math.PI; // Offset from functions
          const apiRadius = 0.8;
          const apiX = fx + Math.cos(apiAngle) * apiRadius;
          const apiY = fy + 0.5 + Math.sin(apiAngle) * apiRadius;
          const apiZ = fz + Math.sin(apiAngle) * apiRadius;

          const apiGeometry = new THREE.SphereGeometry(0.12, 16, 16);
          const apiMaterial = new THREE.MeshPhongMaterial({
            color: 0xff6b35, // Orange
            emissive: 0xff6b35,
            emissiveIntensity: 0.3
          });
          const apiMesh = new THREE.Mesh(apiGeometry, apiMaterial);
          apiMesh.position.set(apiX, apiY, apiZ);
          scene.add(apiMesh);

          // Connect API to file with black line
          const apiPoints = [
            new THREE.Vector3(fx, fy, fz),
            new THREE.Vector3(apiX, apiY, apiZ)
          ];
          const apiLineGeometry = new THREE.BufferGeometry().setFromPoints(apiPoints);
          const apiLineMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 1 });
          const apiLine = new THREE.Line(apiLineGeometry, apiLineMaterial);
          scene.add(apiLine);
        });

        // Connect file to directory with black line
        const points = [
          new THREE.Vector3(x, 0, z),
          new THREE.Vector3(fx, fy, fz)
        ];
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000, opacity: 0.7, transparent: true });
        const line = new THREE.Line(lineGeometry, lineMaterial);
        scene.add(line);
      });

      angleOffset += (Math.PI * 2) / directoryMap.size;
    });

    // Visualize connections between files
    const filePositionMap = new Map<string, THREE.Vector3>();
    scene.children.forEach(child => {
      if (child instanceof THREE.Mesh) {
        const fileData = meshToFileMap.current.get(child);
        if (fileData) {
          filePositionMap.set(fileData.path, child.position.clone());
        }
      }
    });

    data.connections.forEach(conn => {
      const sourcePos = filePositionMap.get(conn.source);
      const targetPos = filePositionMap.get(conn.target);

      if (sourcePos && targetPos) {
        // Create directional arrow from source to target
        const direction = new THREE.Vector3().subVectors(targetPos, sourcePos);
        const length = direction.length();

        // Create arrow helper for directional connection
        const arrowHelper = new THREE.ArrowHelper(
          direction.normalize(),
          sourcePos,
          length,
          0x000000, // Black
          0.3, // Head length
          0.2  // Head width
        );
        arrowHelper.line.material.transparent = true;
        arrowHelper.line.material.opacity = 0.5;
        scene.add(arrowHelper);
      }
    });

    // Add central repository node
    const repoGeometry = new THREE.SphereGeometry(1.5, 64, 64);
    const repoMaterial = new THREE.MeshPhongMaterial({
      color: 0xff6b35,
      emissive: 0xff6b35,
      emissiveIntensity: 0.4
    });
    const repoMesh = new THREE.Mesh(repoGeometry, repoMaterial);
    scene.add(repoMesh);
  };

  const getFileStatusColor = (status: string): number => {
    switch (status) {
      case 'new':
        return 0x00ff00; // Green
      case 'deleted':
        return 0xff0000; // Red
      case 'modified':
        return 0xffaa00; // Orange
      case 'unchanged':
        return 0x4a90e2; // Blue (thin rectangular)
      default:
        return 0x888888;
    }
  };

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
          <div className="text-white text-xl">Loading analysis...</div>
        </div>
      )}

      {syncing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
          <div className="text-center">
            <div className="text-white text-xl mb-2">Syncing repository...</div>
            <div className="text-gray-400 text-sm">Analyzing with Gemini AI</div>
          </div>
        </div>
      )}

      {error && !syncing && (
        <div className="absolute top-4 left-4 right-4 bg-yellow-900 border border-yellow-600 text-yellow-200 p-4 rounded">
          <p className="font-semibold">{error}</p>
        </div>
      )}

      {/* Hover tooltip */}
      {hoveredFile && (
        <div
          className="fixed z-50 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl p-4 max-w-md pointer-events-none"
          style={{
            left: mousePosition.x + 20,
            top: mousePosition.y + 20
          }}
        >
          <div className="text-sm">
            <p className="font-bold text-white mb-2">{hoveredFile.path.split('/').pop()}</p>
            <p className="text-gray-400 text-xs mb-2">{hoveredFile.path}</p>
            <div className="space-y-1 text-xs">
              <p>
                <span className="text-gray-500">Status:</span>{' '}
                <span className={`font-semibold ${
                  hoveredFile.status === 'new' ? 'text-green-400' :
                  hoveredFile.status === 'deleted' ? 'text-red-400' :
                  hoveredFile.status === 'modified' ? 'text-orange-400' :
                  'text-blue-400'
                }`}>
                  {hoveredFile.status.toUpperCase()}
                </span>
              </p>
              <p><span className="text-gray-500">Language:</span> {hoveredFile.language}</p>
              <p><span className="text-gray-500">Functions:</span> {hoveredFile.functions.length}</p>
              <p><span className="text-gray-500">Lines:</span> {hoveredFile.linesOfCode}</p>
              <p><span className="text-gray-500">API Calls:</span> {hoveredFile.apiCalls.length}</p>

              {hoveredFile.functions.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-700">
                  <p className="text-gray-500 mb-1">Functions:</p>
                  {hoveredFile.functions.slice(0, 3).map((fn, idx) => (
                    <p key={idx} className="text-gray-300 ml-2">• {fn.name}</p>
                  ))}
                  {hoveredFile.functions.length > 3 && (
                    <p className="text-gray-500 ml-2">... +{hoveredFile.functions.length - 3} more</p>
                  )}
                </div>
              )}

              {hoveredFile.apiCalls.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-700">
                  <p className="text-gray-500 mb-1">API Calls:</p>
                  {hoveredFile.apiCalls.slice(0, 2).map((api, idx) => (
                    <p key={idx} className="text-gray-300 ml-2 text-xs">
                      • {api.method} {api.endpoint}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sync Button */}
      <div className="absolute top-4 right-4">
        <button
          onClick={handleSync}
          disabled={syncing}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {syncing ? (
            <>
              <span className="animate-spin">🔄</span>
              Syncing...
            </>
          ) : (
            <>
              🔄 Sync Repository
            </>
          )}
        </button>
      </div>

      {/* Legend */}
      {analysis && (
        <div className="absolute bottom-4 left-4 bg-gray-900 bg-opacity-90 p-4 rounded-lg text-sm max-w-xs">
          <h3 className="font-bold text-white mb-2">Legend</h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500"></div>
              <span className="text-gray-300">Files (Thin Blue)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-400 opacity-40"></div>
              <span className="text-gray-300">Folders (Translucent)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
              <span className="text-gray-300">Functions (Yellow)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-orange-500"></div>
              <span className="text-gray-300">API Endpoints (Orange)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-black"></div>
              <span className="text-gray-300">Connections →</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-400">
            <p>Files: {analysis.stats.totalFiles}</p>
            <p>Functions: {analysis.stats.totalFunctions}</p>
            <p>Connections: {analysis.stats.totalConnections}</p>
            <p>APIs: {analysis.stats.totalAPIs}</p>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-4 right-4 bg-gray-800 bg-opacity-90 p-3 rounded text-xs">
        <p className="text-gray-300 mb-2"><strong>Controls:</strong></p>
        <ul className="text-gray-400 space-y-1">
          <li>🖱️ Drag: Move camera</li>
          <li>🖱️ Scroll: Zoom in/out</li>
          <li>🖱️ Hover: View file details</li>
          <li>🖱️ Click file: Open in VSCode</li>
        </ul>
      </div>
    </div>
  );
}
