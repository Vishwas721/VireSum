import { Canvas } from '@react-three/fiber';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { TorusKnot } from '@react-three/drei';

function AnimatedTorusKnot() {
  const meshRef = useRef();

  useFrame((state) => {
    meshRef.current.rotation.x = state.clock.getElapsedTime();
    meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.5;
  });

  return (
    <TorusKnot ref={meshRef} args={[1, 0.3, 128, 16]} scale={0.5}>
      <meshStandardMaterial
        color="#4299e1"
        metalness={0.5}
        roughness={0.3}
      />
    </TorusKnot>
  );
}

export default function LoadingSpinner() {
  return (
    <div className="w-32 h-32">
      <Canvas camera={{ position: [0, 0, 4] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <AnimatedTorusKnot />
      </Canvas>
    </div>
  );
}