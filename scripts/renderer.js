document.addEventListener('DOMContentLoaded', () => {
    const svg = document.getElementById('canvas');
    
    let scale = 1;
    let panX = 0;
    let panY = 0;
    let mode = 'pan'; // 'pan', 'create', or 'delete'
    let vertexCounter = 1;
    let edgeStart = null;
    let draggedVertex = null;

    // Graph data structure
    const graph = {
        vertices: new Map(), // id -> {element, x, y}
        edges: new Set()     // Set of {from, to, element}
    };

    // Create separate groups for edges and vertices
    const edgeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const vertexGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const graphGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    
    graphGroup.appendChild(edgeGroup);
    graphGroup.appendChild(vertexGroup);
    svg.appendChild(graphGroup);

    // UI Elements
    const toggleBtn = document.getElementById('mode-toggle');
    const deleteBtn = document.getElementById('delete-toggle');
    const downloadBtn = document.getElementById('download-toggle');
    const downloadModal = document.getElementById('download-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const downloadSvgBtn = document.getElementById('download-svg');
    const downloadPngBtn = document.getElementById('download-png');

downloadBtn.addEventListener('click', () => {
    downloadModal.classList.remove('hidden');
});

closeModalBtn.addEventListener('click', () => {
    downloadModal.classList.add('hidden');
});

downloadModal.addEventListener('click', (e) => {
    if (e.target === downloadModal) {
        downloadModal.classList.add('hidden');
    }
});
    
    const vertexCountEl = document.getElementById('vertex-count');
    const edgeCountEl = document.getElementById('edge-count');
    const minDegreeEl = document.getElementById('min-degree');
    const avgDegreeEl = document.getElementById('avg-degree');
    const girthEl = document.getElementById('girth');
    const diameterEl = document.getElementById('diameter');
    const isConnectedEl = document.getElementById('is-connected');

    // Properties panel toggle
    const propertiesToggle = document.getElementById('properties-toggle');
    const propertiesPanel = document.querySelector('.properties-panel');
    
    propertiesToggle.addEventListener('click', () => {
        propertiesPanel.classList.toggle('collapsed');
    });

    function updateTransform() {
        graphGroup.setAttribute('transform', 
            `translate(${panX}, ${panY}) scale(${scale})`);
    }

    function drawVertex(x, y, id) {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', 20);
        circle.setAttribute('fill', '#9d7bb8');
        circle.setAttribute('data-id', id);
        circle.classList.add('vertex');
        vertexGroup.appendChild(circle);
        
        graph.vertices.set(id, { element: circle, x, y });
        updateProperties();
        return circle;
    }

    function drawEdge(fromId, toId) {
        const from = graph.vertices.get(fromId);
        const to = graph.vertices.get(toId);
        
        // Check if edge already exists
        const edgeExists = Array.from(graph.edges).some(e => 
            (e.from === fromId && e.to === toId) || 
            (e.from === toId && e.to === fromId)
        );
        if (edgeExists) return null;

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', from.x);
        line.setAttribute('y1', from.y);
        line.setAttribute('x2', to.x);
        line.setAttribute('y2', to.y);
        line.setAttribute('stroke', '#d4a574');
        line.setAttribute('stroke-width', 2);
        line.classList.add('edge');
        edgeGroup.appendChild(line);
        
        graph.edges.add({ from: fromId, to: toId, element: line });
        updateProperties();
        return line;
    }

    function updateEdgePositions(vertexId) {
        const vertex = graph.vertices.get(vertexId);
        if (!vertex) return;

        Array.from(graph.edges).forEach(edge => {
            if (edge.from === vertexId) {
                edge.element.setAttribute('x1', vertex.x);
                edge.element.setAttribute('y1', vertex.y);
            }
            if (edge.to === vertexId) {
                edge.element.setAttribute('x2', vertex.x);
                edge.element.setAttribute('y2', vertex.y);
            }
        });
    }

    function drawEdge(fromId, toId) {
        // Prevent self-loops
        if (fromId === toId) return null;
        
        const from = graph.vertices.get(fromId);
        const to = graph.vertices.get(toId);
        
        // Check if edge already exists
        const edgeExists = Array.from(graph.edges).some(e => 
            (e.from === fromId && e.to === toId) || 
            (e.from === toId && e.to === fromId)
        );
        if (edgeExists) return null;

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', from.x);
        line.setAttribute('y1', from.y);
        line.setAttribute('x2', to.x);
        line.setAttribute('y2', to.y);
        line.setAttribute('stroke', '#d4a574');
        line.setAttribute('stroke-width', 2);
        line.classList.add('edge');
        edgeGroup.appendChild(line);
        
        graph.edges.add({ from: fromId, to: toId, element: line });
        updateProperties();
        return line;
    }

    function deleteEdge(edgeElement) {
        const edge = Array.from(graph.edges).find(e => e.element === edgeElement);
        if (edge) {
            edge.element.remove();
            graph.edges.delete(edge);
            updateProperties();
        }
    }

    function getDegrees() {
        const degrees = new Map();
        graph.vertices.forEach((_, id) => degrees.set(id, 0));
        
        graph.edges.forEach(edge => {
            degrees.set(edge.from, degrees.get(edge.from) + 1);
            degrees.set(edge.to, degrees.get(edge.to) + 1);
        });
        
        return degrees;
    }

    function getAdjacencyList() {
        const adj = new Map();
        graph.vertices.forEach((_, id) => adj.set(id, []));
        
        graph.edges.forEach(edge => {
            adj.get(edge.from).push(edge.to);
            adj.get(edge.to).push(edge.from);
        });
        
        return adj;
    }

    function isConnected() {
        if (graph.vertices.size === 0) return false;
        if (graph.vertices.size === 1) return true;

        // BFS to check connectivity
        const visited = new Set();
        const queue = [graph.vertices.keys().next().value];
        visited.add(queue[0]);

        const adj = getAdjacencyList();

        while (queue.length > 0) {
            const current = queue.shift();
            const neighbors = adj.get(current);
            
            neighbors.forEach(n => {
                if (!visited.has(n)) {
                    visited.add(n);
                    queue.push(n);
                }
            });
        }

        return visited.size === graph.vertices.size;
    }

    // BFS to find shortest path length between two vertices
    function bfs(start, end) {
        if (start === end) return 0;
        
        const visited = new Set([start]);
        const queue = [[start, 0]];
        const adj = getAdjacencyList();

        while (queue.length > 0) {
            const [current, dist] = queue.shift();
            
            for (const neighbor of adj.get(current)) {
                if (neighbor === end) return dist + 1;
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push([neighbor, dist + 1]);
                }
            }
        }
        
        return Infinity;
    }

    function calculateGirth() {
        if (graph.edges.size === 0) return Infinity;
        
        let minCycle = Infinity;
        const adj = getAdjacencyList();
        
        // For each vertex, do BFS and look for cycles
        for (const start of graph.vertices.keys()) {
            const dist = new Map();
            const parent = new Map();
            const queue = [start];
            dist.set(start, 0);
            parent.set(start, null);
            
            while (queue.length > 0) {
                const u = queue.shift();
                
                for (const v of adj.get(u)) {
                    if (!dist.has(v)) {
                        dist.set(v, dist.get(u) + 1);
                        parent.set(v, u);
                        queue.push(v);
                    } else if (parent.get(u) !== v) {
                        // Found a cycle
                        const cycleLength = dist.get(u) + dist.get(v) + 1;
                        minCycle = Math.min(minCycle, cycleLength);
                    }
                }
            }
        }
        
        return minCycle;
    }

    function calculateDiameter() {
        if (!isConnected()) return Infinity;
        if (graph.vertices.size <= 1) return 0;
        
        let maxDist = 0;
        const vertices = Array.from(graph.vertices.keys());
        
        for (let i = 0; i < vertices.length; i++) {
            for (let j = i + 1; j < vertices.length; j++) {
                const dist = bfs(vertices[i], vertices[j]);
                maxDist = Math.max(maxDist, dist);
            }
        }
        
        return maxDist;
    }

    function updateProperties() {
        vertexCountEl.textContent = graph.vertices.size;
        edgeCountEl.textContent = graph.edges.size;
        
        if (graph.vertices.size > 0) {
            const degrees = Array.from(getDegrees().values());
            const minDegree = Math.min(...degrees);
            const avgDegree = (degrees.reduce((a, b) => a + b, 0) / degrees.length).toFixed(2);
            
            minDegreeEl.textContent = minDegree;
            avgDegreeEl.textContent = avgDegree;
            
            // Girth
            const girth = calculateGirth();
            girthEl.textContent = girth === Infinity ? '∞' : girth;
            
            // Diameter
            const diameter = calculateDiameter();
            diameterEl.textContent = diameter === Infinity ? '∞' : diameter;
            
            isConnectedEl.textContent = isConnected() ? 'Yes' : 'No';
            isConnectedEl.style.color = isConnected() ? '#6ec76e' : '#e87c7c';
        } else {
            minDegreeEl.textContent = '—';
            avgDegreeEl.textContent = '—';
            girthEl.textContent = '—';
            diameterEl.textContent = '—';
            isConnectedEl.textContent = '—';
            isConnectedEl.style.color = 'var(--text-secondary)';
        }
    }

    function screenToSVG(screenX, screenY) {
        const pt = svg.createSVGPoint();
        pt.x = screenX;
        pt.y = screenY;
        const svgPt = pt.matrixTransform(graphGroup.getScreenCTM().inverse());
        return { x: svgPt.x, y: svgPt.y };
    }

    function cancelEdgeCreation() {
        if (edgeStart) {
            edgeStart.setAttribute('fill', '#9d7bb8');
            edgeStart = null;
        }
    }

    function setMode(newMode) {
        mode = newMode;
        cancelEdgeCreation();
        
        // Update UI
        toggleBtn.classList.remove('active');
        deleteBtn.classList.remove('active');
        svg.classList.remove('panning', 'creating', 'deleting', 'active-drag');
        
        if (mode === 'create') {
            toggleBtn.querySelector('.mode-icon').textContent = '●';
            toggleBtn.querySelector('.mode-text').textContent = 'Create';
            toggleBtn.classList.add('active');
            svg.classList.add('creating');
        } else if (mode === 'delete') {
            deleteBtn.classList.add('active');
            svg.classList.add('deleting');
        } else {
            toggleBtn.querySelector('.mode-icon').textContent = '◐';
            toggleBtn.querySelector('.mode-text').textContent = 'Pan';
            svg.classList.add('panning');
        }
    }

    toggleBtn.addEventListener('click', () => {
        setMode(mode === 'create' ? 'pan' : 'create');
    });

    deleteBtn.addEventListener('click', () => {
        setMode(mode === 'delete' ? 'pan' : 'delete');
    });

    function downloadSVG() {
        // Clone the SVG
        const svgClone = svg.cloneNode(true);
        
        // Get bounding box of all elements
        const vertices = Array.from(graph.vertices.values());
        if (vertices.length === 0) return;
        
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        vertices.forEach(v => {
            minX = Math.min(minX, v.x);
            minY = Math.min(minY, v.y);
            maxX = Math.max(maxX, v.x);
            maxY = Math.max(maxY, v.y);
        });
        
        const padding = 50;
        const width = maxX - minX + 2 * padding;
        const height = maxY - minY + 2 * padding;
        
        // Set viewBox to crop to graph
        svgClone.setAttribute('width', width);
        svgClone.setAttribute('height', height);
        svgClone.setAttribute('viewBox', `${minX - padding} ${minY - padding} ${width} ${height}`);
        svgClone.style.background = '#242424';
        
        // Serialize SVG
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svgClone);
        
        // Download
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'graph.svg';
        link.click();
        URL.revokeObjectURL(url);
        
        downloadModal.classList.add('hidden');
    }

    function downloadPNG() {
        // Get bounding box
        const vertices = Array.from(graph.vertices.values());
        if (vertices.length === 0) return;
        
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        vertices.forEach(v => {
            minX = Math.min(minX, v.x);
            minY = Math.min(minY, v.y);
            maxX = Math.max(maxX, v.x);
            maxY = Math.max(maxY, v.y);
        });
        
        const padding = 50;
        const width = maxX - minX + 2 * padding;
        const height = maxY - minY + 2 * padding;
        
        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        // Fill background
        ctx.fillStyle = '#242424';
        ctx.fillRect(0, 0, width, height);
        
        // Draw edges
        ctx.strokeStyle = '#d4a574';
        ctx.lineWidth = 2;
        graph.edges.forEach(edge => {
            const from = graph.vertices.get(edge.from);
            const to = graph.vertices.get(edge.to);
            ctx.beginPath();
            ctx.moveTo(from.x - minX + padding, from.y - minY + padding);
            ctx.lineTo(to.x - minX + padding, to.y - minY + padding);
            ctx.stroke();
        });
        
        // Draw vertices
        ctx.fillStyle = '#9d7bb8';
        graph.vertices.forEach(vertex => {
            ctx.beginPath();
            ctx.arc(vertex.x - minX + padding, vertex.y - minY + padding, 20, 0, 2 * Math.PI);
            ctx.fill();
        });
        
        // Download
        canvas.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'graph.png';
            link.click();
            URL.revokeObjectURL(url);
            downloadModal.classList.add('hidden');
        });
    }

    downloadSvgBtn.addEventListener('click', downloadSVG);
    downloadPngBtn.addEventListener('click', downloadPNG);

    // Initialize with a more interesting tree (binary tree with depth 3)
    function initializeTree() {
        const centerX = 400;
        const centerY = 280;
        
        const levelSpacing = 80;
        
        // Level 0 (root)
        drawVertex(centerX, centerY - 2 * levelSpacing, 1);
        
        // Level 1
        drawVertex(centerX - 100, centerY - levelSpacing, 2);
        drawVertex(centerX + 100, centerY - levelSpacing, 3);
        
        // Level 2
        drawVertex(centerX - 150, centerY, 4);
        drawVertex(centerX - 50, centerY, 5);
        drawVertex(centerX + 50, centerY, 6);
        drawVertex(centerX + 150, centerY, 7);
        
        // Edges - level 0 to level 1
        drawEdge(1, 2);
        drawEdge(1, 3);
        
        // Edges - level 1 to level 2
        drawEdge(2, 4);
        drawEdge(2, 5);
        drawEdge(3, 6);
        drawEdge(3, 7);
        
        vertexCounter = 8;
    }

    initializeTree();
    setMode('pan');

    // Zoom
    svg.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        scale *= delta;
        updateTransform();
    });

    // Interaction logic
    let isPanning = false;
    let lastX, lastY;

    svg.addEventListener('mousedown', (e) => {
        if (mode === 'pan') {
            // Check if clicking on vertex to drag it
            if (e.target.classList && e.target.classList.contains('vertex')) {
                draggedVertex = parseInt(e.target.getAttribute('data-id'));
                lastX = e.clientX;
                lastY = e.clientY;
                e.preventDefault();
            } else if (e.target === svg || e.target === graphGroup || 
                e.target === edgeGroup || e.target === vertexGroup) {
                isPanning = true;
                svg.classList.add('active-drag');
                lastX = e.clientX;
                lastY = e.clientY;
                e.preventDefault();
            }
        } else if (mode === 'create') {
            if (e.target.classList && e.target.classList.contains('vertex')) {
                if (!edgeStart) {
                    edgeStart = e.target;
                    edgeStart.setAttribute('fill', '#ff6b6b');
                } else {
                    const fromId = parseInt(edgeStart.getAttribute('data-id'));
                    const toId = parseInt(e.target.getAttribute('data-id'));
                    drawEdge(fromId, toId);
                    cancelEdgeCreation();
                }
            } else if (e.target === svg || e.target === graphGroup || 
                       e.target === edgeGroup || e.target === vertexGroup) {
                const coords = screenToSVG(e.clientX, e.clientY);
                drawVertex(coords.x, coords.y, vertexCounter++);
                cancelEdgeCreation();
            }
        } else if (mode === 'delete') {
            if (e.target.classList && e.target.classList.contains('vertex')) {
                const id = parseInt(e.target.getAttribute('data-id'));
                deleteVertex(id);
            } else if (e.target.classList && e.target.classList.contains('edge')) {
                deleteEdge(e.target);
            }
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (isPanning) {
            panX += e.clientX - lastX;
            panY += e.clientY - lastY;
            lastX = e.clientX;
            lastY = e.clientY;
            updateTransform();
        } else if (draggedVertex !== null) {
            // Drag vertex
            const deltaX = e.clientX - lastX;
            const deltaY = e.clientY - lastY;
            lastX = e.clientX;
            lastY = e.clientY;
            
            const vertex = graph.vertices.get(draggedVertex);
            if (vertex) {
                // Update vertex position (accounting for scale)
                vertex.x += deltaX / scale;
                vertex.y += deltaY / scale;
                vertex.element.setAttribute('cx', vertex.x);
                vertex.element.setAttribute('cy', vertex.y);
                
                // Update connected edges
                updateEdgePositions(draggedVertex);
            }
        }
    });

    document.addEventListener('mouseup', () => {
        isPanning = false;
        draggedVertex = null;
        svg.classList.remove('active-drag');
    });
});