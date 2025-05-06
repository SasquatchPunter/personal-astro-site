// Positions and rotates the billboard vertex
gl_Position = projectionMatrix * (modelViewMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0) + vec4(position.x, position.y, 0.0, 0.0));

// Rotation matrix for view alignment
mat3 billboardRotation = mat3(
    normalize(vec3(modelViewMatrix[0][0], modelViewMatrix[1][0], modelViewMatrix[2][0])),
    normalize(vec3(modelViewMatrix[0][1], modelViewMatrix[1][1], modelViewMatrix[2][1])),
    normalize(vec3(modelViewMatrix[0][2], modelViewMatrix[1][2], modelViewMatrix[2][2]))
);

// Apply rotation to normals
vNormal = normalize(normalMatrix * (billboardRotation * normal));