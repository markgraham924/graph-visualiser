// Canvas setup
let canvas = document.getElementById('graph');
let ctx = canvas.getContext('2d');
ctx.font = '20px Arial';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillStyle = 'black';
ctx.strokeStyle = 'black';
ctx.lineWidth = 2;

// Dragging functionality global variables
let drag = false;
let draggedNode = null;

startNode = '';
endNode = '';

// Graph data
let vertices = {};
let edges = [];

// Test data for quick setup
const verticesTest = {
    A: { x: 300, y: 100, radius: 20 }, B: { x: 100, y: 200, radius: 20 },
    C: { x: 100, y: 300, radius: 20 }, D: { x: 300, y: 400, radius: 20 },
    E: { x: 400, y: 300, radius: 20 }, F: { x: 400, y: 200, radius: 20 },
    G: { x: 200, y: 275, radius: 20 }, H: { x: 50, y: 50, radius: 20 }
};
const edgesTest = [
    { start: 'A', end: 'B' }, { start: 'A', end: 'C' },
    { start: 'A', end: 'E' }, { start: 'A', end: 'F' },
    { start: 'B', end: 'C' }, { start: 'C', end: 'D' },
    { start: 'E', end: 'F' }, { start: 'F', end: 'B' },
    { start: 'E', end: 'G' }
];

function calculateDegree(vertex) {
    let degree = 0;
    edges.forEach(edge => {
        if (edge.start === vertex || edge.end === vertex) {
            degree++;
        }
    });
    return degree;
}


function infoUpdate() {
    divContent = document.getElementById('dataInfo');
    divContent.innerHTML = '';
    divContent.innerHTML += '<h3>Vertices</h3>';
    divContent.innerHTML += '<ul>';
    Object.keys(vertices).forEach(key => {
        divContent.innerHTML += `<li>${key}: (${vertices[key].x}, ${vertices[key].y})</li>`;
    });
    divContent.innerHTML += '</ul>';
    divContent.innerHTML += '<h3>Edges</h3>';
    divContent.innerHTML += '<ul>';
    edges.forEach(edge => {
        divContent.innerHTML += `<li>${edge.start} -> ${edge.end}</li>`;
    });
    divContent.innerHTML += '</ul>';
    divContent.innerHTML += '<h3>Graph Properties</h3>';
    divContent.innerHTML += '<ul>';
    //divContent.innerHTML += `<li>Connected: ${isTree()}</li>`;
    divContent.innerHTML += '</ul>';
    
}

function testData() {
    vertices = verticesTest;
    edges = edgesTest;
    drawGraph();
    infoUpdate();
}
testData();

function clearData() {
    vertices = {};
    edges = [];
    drawGraph();
}

function updateDisplay() {
    drawGraph();
    mapPoints();
    infoUpdate();
}

function addNode() {
    const node = document.getElementById('node').value; // Keep as string, assuming nodes are identified by letters or numbers
    const x = document.getElementById('x').value ? parseFloat(document.getElementById('x').value) : 450; // Corrected typo
    const y = document.getElementById('y').value ? parseFloat(document.getElementById('y').value) : 450;

    if (!vertices[node] && node && !isNaN(x) && !isNaN(y)) { // Check that x and y are numbers
        vertices[node] = { x: x, y: y, radius: 20 }; // Use parsed x and y
        drawGraph();
        infoUpdate();
    } else {
        alert('Node already exists or missing data');
    }
}

function removeNode() {
    const node = document.getElementById('nodeRemove').value;
    if (vertices[node]) {
        delete vertices[node];
        edges = edges.filter(edge => edge.start !== node && edge.end !== node);
        drawGraph();
        infoUpdate();
    } else {
        alert('Node does not exist');
    }
}

function removeEdge() {
    const start = document.getElementById('startEdgeRemove').value;
    const end = document.getElementById('endEdgeRemove').value;
    if (vertices[start] && vertices[end]) {
        edges = edges.filter(edge => !(edge.start === start && edge.end === end));
        drawGraph();
        infoUpdate();
    } else {
        alert('One or more nodes do not exist');
    }
}

function addEdge() {
    const start = document.getElementById('startEdge').value;
    const end = document.getElementById('endEdge').value;
    if (vertices[start] && vertices[end]) {
        edges
        // continues to add edges and drawing functions
        edges.push({ start, end });
        drawGraph();
        infoUpdate();
    } else {
        alert('One or more nodes do not exist');
    }
}

function calculateDistance(pointA, pointB) {
    return Math.sqrt((pointA.x - pointB.x) ** 2 + (pointA.y - pointB.y) ** 2);
}

// Prepares the graph for Dijkstra's algorithm or other graph operations
function calculatePoints() {
    graph = {};
    Object.keys(vertices).forEach(vertex => {
        graph[vertex] = [];
    });
    edges.forEach(edge => {
        const distance = calculateDistance(vertices[edge.start], vertices[edge.end]);
        graph[edge.start].push({ node: edge.end, weight: distance });
        graph[edge.end].push({ node: edge.start, weight: distance });
    });
    return graph;
}

function mapPoints() {

    graph = calculatePoints();

    //define start and end points
    startNode = document.getElementById('start').value ? document.getElementById('start').value : 'D';
    endNode = document.getElementById('end').value ? document.getElementById('end').value : 'F';

    //data structures for store data whilst alogirthm is running
    let distances = {};
    let prev = {};
    let unvisited = new Set(Object.keys(vertices));

    //initial setup
    Object.keys(vertices).forEach(vertex => {
        distances[vertex] = Infinity;
        prev[vertex] = null;
    });
    distances[startNode] = 0;

    //until everypoint has been visited execute the algorithm
    while (unvisited.size > 0) {

        //define the current node as the node with the smallest distance from the unvisited set
        let currentNode = Array.from(unvisited).reduce((minNode, node) => distances[node] < distances[minNode] ? node : minNode, Array.from(unvisited)[0]);

        //if the current node is the end node, break the loop
        if (currentNode === endNode) {
            break;
        }

        //remove the current node from the unvisited set
        unvisited.delete(currentNode);

        //for each neighbour of the current node calculate the distancce, if the distance is shorter than the current distance, update the distance and the previous node
        //i.e. move forward a step if the current node is better than the previous node
        graph[currentNode].forEach(neighbour => {
            if (unvisited.has(neighbour.node)) {
                let proposedDistance = distances[currentNode] + neighbour.weight;
                if (proposedDistance < distances[neighbour.node]) {
                    distances[neighbour.node] = proposedDistance;
                    prev[neighbour.node] = currentNode;
                }
            }
        });
    }

    //data structure to store the path
    let path = [];
    //start at the end node and work backwards to the start node
    let current = endNode;
    //executes until it reaches the start node as the current node will be null due to their being no previous node to the start node
    while (current !== null) {
        //adds the current node to the path in reverse order
        path.unshift(current);
        //sets the current node to the previous node to the just used node
        current = prev[current];
    }
    drawGraph();
    if (path[0] === startNode) {
        drawPath(path);
    }
    
}

function drawGraph() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw edges
    edges.forEach(edge => {
        const start = vertices[edge.start];
        const end = vertices[edge.end];
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
    });
    // Draw vertices
    Object.keys(vertices).forEach(key => {
        const vertex = vertices[key];
        ctx.beginPath();
        ctx.arc(vertex.x, vertex.y, vertex.radius, 0, 2 * Math.PI);
        ctx.fillStyle = 'black';
        if (calculateDegree(key) === 1) {
            ctx.fillStyle = 'red';
        }
        if (startNode === key) {
            ctx.fillStyle = 'green';
        }
        console.log(start.value, end.value)
        if (endNode === key) {
            ctx.fillStyle = 'blue';
        }
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = 'white';
        ctx.fillText(key, vertex.x, vertex.y);
    });
}

function drawPath(path) {
    if (path.length > 0) {
        ctx.beginPath();
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 4;
        let firstPoint = vertices[path[0]];
        ctx.moveTo(firstPoint.x, firstPoint.y);
        path.slice(1).forEach(point => {
            let vertex = vertices[point];
            ctx.lineTo(vertex.x, vertex.y);
        });
        ctx.stroke();
        // Reset defaults
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
    }
}

// Event listeners for dragging functionality
canvas.addEventListener('mousedown', function (e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    Object.entries(vertices).forEach(([key, vertex]) => {
        if (Math.sqrt((x - vertex.x) ** 2 + (y - vertex.y) ** 2) < vertex.radius) {
            drag = true;
            draggedNode = vertex;
            updateDisplay();
        }
    });
});

canvas.addEventListener('mousemove', function (e) {
    if (drag && draggedNode) {
        const rect = canvas.getBoundingClientRect();
        draggedNode.x = e.clientX - rect.left;
        draggedNode.y = e.clientY - rect.top;
        updateDisplay();
    }
});

canvas.addEventListener('mouseup', function () {
    drag = false;
    draggedNode = null;
});

drawGraph();