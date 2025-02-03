class Cylinder {
    constructor() {
        this.type = "cylinder";
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.segments = 10;
        this.matrix = new Matrix4();
    }

    render() {
        var rgba = this.color;

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the model matrix u_ModelMatrix variable
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Bottom
        let angleStep = 360 / this.segments;
        for (let angle = 0; angle < 360; angle += angleStep) {
            let centerPoint = [xy[0], xy[1]];
            let angle1 = angle;
            let angle2 = angle + angleStep;
            let vec1 = [Math.cos(angle1 * Math.PI / 180), Math.sin(angle1 * Math.PI / 180)];
            let vec2 = [Math.cos(angle2 * Math.PI / 180), Math.sin(angle2 * Math.PI / 180)];
            let pt1 = [centerPoint[0] + vec1[0], centerPoint[1] + vec1[1]];
            let pt2 = [centerPoint[0] + vec2[0], centerPoint[1] + vec2[1]];
            drawTriangle([xy[0], xy[1], pt1[0], pt1[1], pt2[0], pt2[1]])
        }


        // Front
        drawTriangle3D([0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0])
        drawTriangle3D([0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0])

        // Darken Top Color
        gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1] * 0.9, rgba[2] * 0.9, rgba[3]);

        // Top (video)
        drawTriangle3D([0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0])
        drawTriangle3D([0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0])

        // Darken Bottom Color
        gl.uniform4f(u_FragColor, rgba[0] * 0.8, rgba[1] * 0.8, rgba[2] * 0.8, rgba[3]);

        // Bottom
        drawTriangle3D([0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0])
        drawTriangle3D([0.0, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0])

        // Darken Left Color
        gl.uniform4f(u_FragColor, rgba[0] * 0.8, rgba[1] * 0.8, rgba[2] * 0.8, rgba[3]);

        // Left
        drawTriangle3D([0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0])
        drawTriangle3D([0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0])

        // Darken Right Color
        gl.uniform4f(u_FragColor, rgba[0] * 0.7, rgba[1] * 0.7, rgba[2] * 0.7, rgba[3]);

        // Right 
        drawTriangle3D([1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0])
        drawTriangle3D([1.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0])

        // Darken Back Color
        gl.uniform4f(u_FragColor, rgba[0] * 0.6, rgba[1] * 0.6, rgba[2] * 0.6, rgba[3]);

        // Back 
        drawTriangle3D([1.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0])
        drawTriangle3D([1.0, 1.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0])
    }
}