import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment } from '@react-three/drei';

function Model(props) {
 const { scene } = useGLTF('/clock_model.glb');
 const group = useRef();
 
 useFrame((state) => {
  // Gentle rotation animation
  if (group.current) {
   group.current.rotation.y += 0.005;
  }
 });

 return (
  <group ref={group} {...props} dispose={null}>
   <primitive object={scene} scale={20} />
  </group>
 );
}

// Preload the model
useGLTF.preload('/clock_model.glb');

export default function WatchModel() {
 return (
  <div style={{ width: '100%', height: '100%', minHeight: '400px', cursor: 'grab' }}>
   <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
    <ambientLight intensity={2} />
    <directionalLight position={[5, 5, 5]} intensity={3} />
    <directionalLight position={[-5, 5, 5]} intensity={2} />
    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} />
    <Environment preset="city" />
    <React.Suspense fallback={null}>
     <Model position={[0, -0.5, 0]} />
    </React.Suspense>
    <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1} />
   </Canvas>
  </div>
 );
}
