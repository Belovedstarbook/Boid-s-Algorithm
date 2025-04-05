let width = window.innerWidth, height = window.innerHeight;
// let width = 500, height = 500;
let numBoids = 100;
let perceptionRadius = 20;  // Range for detecting neighbors

let avoidfactor = 0.02;
let matchingfactor = 0.05;
let centeringfactor = 0.05;
// Create a div for controls    

function createBoids(count) {
    return d3.range(count).map(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2
    }));
}

let boids = createBoids(numBoids);

const svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height - document.getElementById("controls").offsetHeight) // Adjust SVG height
    .style("position", "absolute")
    .style("top", `${document.getElementById("controls").offsetHeight}px`) // Push SVG below the controls
    .style("left", "0");


let boidElements = svg.selectAll("circle")
    .data(boids)
    .enter().append("circle")
    .attr("r", 5)
    .attr("fill", "blue");

// Flocking behavior functions
function applyFlocking() {
    boids.forEach((boid, i) => {
        let neighbors = boids.filter(other => {
            let dx = other.x - boid.x;
            let dy = other.y - boid.y;
            return (Math.sqrt(dx * dx + dy * dy) < perceptionRadius) && (other !== boid);
        });

        if (neighbors.length === 0) return;

        let avgVX = 0, avgVY = 0, centerX = 0, centerY = 0, separationX = 0, separationY = 0;

        neighbors.forEach(other => {
            avgVX += other.vx;
            avgVY += other.vy;
            centerX += other.x;
            centerY += other.y;
            separationX += (boid.x - other.x);
            separationY += (boid.y - other.y);
        });

        avgVX /= neighbors.length;   // Alignment: match velocity of neighbors
        avgVY /= neighbors.length;

        centerX /= neighbors.length; // Cohesion: move toward center of mass
        centerY /= neighbors.length;

        boid.vx += (avgVX - boid.vx) * matchingfactor + separationX * avoidfactor + (centerX - boid.x) * centeringfactor;
        boid.vy += (avgVY - boid.vy) * matchingfactor + separationY * avoidfactor + (centerY - boid.y) * centeringfactor;
    });
}

// Movement and rendering update
function updateBoids() {
    applyFlocking();

    boids.forEach(boid => {
        boid.x += boid.vx;
        boid.y += boid.vy;

        // Wrap-around edges
        if (boid.x < 0) boid.x = width;
        if (boid.x > width) boid.x = 0;
        if (boid.y < 0) boid.y = height;
        if (boid.y > height) boid.y = 0;
    });

    boidElements.attr("cx", d => d.x).attr("cy", d => d.y);
}

// Handle window resize
window.addEventListener("resize", () => {
    width = window.innerWidth;
    height = window.innerHeight;
    svg.attr("width", width).attr("height", height);
    boids = createBoids(numBoids);
});

// Handle slider input
document.getElementById("boidCount").addEventListener("input", function () {
    numBoids = +this.value;
    document.getElementById("boidCountValue").textContent = numBoids; // Update the displayed value

    // numBoids = this.value;
    boids = createBoids(numBoids);

    boidElements = svg.selectAll("circle").data(boids);

    boidElements.exit().remove();  // Remove extra boids
    boidElements.enter().append("circle")
        .attr("r", 5)
        .attr("fill", "blue")
        .merge(boidElements);
});


document.getElementById("perceptionRange").addEventListener("input", function () {
    perceptionRadius = this.value;
    document.getElementById("perceptionRangeValue").textContent = perceptionRadius;
    //     updateBoids();
});


// Animation loop
d3.timer(updateBoids);