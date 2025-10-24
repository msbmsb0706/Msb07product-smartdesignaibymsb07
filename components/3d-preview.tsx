"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, Center } from "@react-three/drei"
import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, RotateCcw } from "lucide-react"

interface ThreeDPreviewProps {
  modelUrl?: string
  modelType: "stl" | "obj" | "preview"
}

function ModelViewer({ modelUrl, modelType }: { modelUrl?: string; modelType: string }) {
  return (
    <mesh>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="#6366f1" />
    </mesh>
  )
}

export function ThreeDPreview({ modelUrl, modelType }: ThreeDPreviewProps) {
  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RotateCcw className="h-5 w-5" />
          3D Preview - Rotate & Zoom
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="aspect-square rounded-lg overflow-hidden bg-muted/20 border border-border/50">
          <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
            <Suspense fallback={<Loader2 className="animate-spin" />}>
              <Environment preset="studio" />
              <ambientLight intensity={0.5} />
              <directionalLight position={[10, 10, 5]} intensity={1} />
              <Center>
                <ModelViewer modelUrl={modelUrl} modelType={modelType} />
              </Center>
              <OrbitControls
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                autoRotate={false}
                maxPolarAngle={Math.PI}
                minPolarAngle={0}
              />
            </Suspense>
          </Canvas>
        </div>
        <p className="text-sm text-muted-foreground mt-2 text-center">
          Click and drag to rotate • Scroll to zoom • Right-click to pan
        </p>
      </CardContent>
    </Card>
  )
}
