"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, Download, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface SignaturePadProps {
  onSave: (signatureData: string) => void;
  onCancel: () => void;
  initialSignature?: string;
}

export default function SignaturePad({
  onSave,
  onCancel,
  initialSignature,
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [hasSignature, setHasSignature] = useState(false);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Get context
    const context = canvas.getContext("2d");
    if (!context) return;

    setCtx(context);

    // Configure context
    context.lineWidth = 2;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = "#000000";

    // Load initial signature if provided
    if (initialSignature) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        context.drawImage(img, 0, 0);
        setHasSignature(true);
      };
      img.src = initialSignature;
    }

    // Handle window resize
    const handleResize = () => {
      const currentDrawing = canvas.toDataURL();
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      // Redraw after resize
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = currentDrawing;
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [initialSignature]);

  // Drawing functions
  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!ctx) return;
    setIsDrawing(true);
    setHasSignature(true);

    // Get coordinates
    let x, y;
    if ("touches" in e) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.nativeEvent.offsetX;
      y = e.nativeEvent.offsetY;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing || !ctx) return;

    // Get coordinates
    let x, y;
    if ("touches" in e) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.nativeEvent.offsetX;
      y = e.nativeEvent.offsetY;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!ctx) return;
    setIsDrawing(false);
    ctx.closePath();
  };

  // Clear the canvas
  const clearCanvas = () => {
    if (!ctx || !canvasRef.current) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setHasSignature(false);
  };

  // Save the signature
  const saveSignature = () => {
    if (!canvasRef.current) return;
    const signatureData = canvasRef.current.toDataURL("image/png");
    onSave(signatureData);
  };

  // Download the signature
  const downloadSignature = () => {
    if (!canvasRef.current) return;
    const signatureData = canvasRef.current.toDataURL("image/png");

    const link = document.createElement("a");
    link.download = "signature.png";
    link.href = signatureData;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Unterschrift</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md p-1 bg-white">
          <canvas
            ref={canvasRef}
            className="w-full h-40 border border-dashed border-gray-300 rounded touch-none"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Unterschreiben Sie mit der Maus oder dem Finger im Feld oben
        </p>
      </CardContent>
      <CardFooter className="flex flex-col md:flex-row md:justify-between max-md:gap-2">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={clearCanvas}>
            <Trash2 className="h-4 w-4 mr-2" />
            Löschen
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadSignature}
            disabled={!hasSignature}
          >
            <Download className="h-4 w-4 mr-2" />
            Speichern
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={onCancel}>
            Abbrechen
          </Button>
          <Button size="sm" onClick={saveSignature} disabled={!hasSignature}>
            <Check className="h-4 w-4 mr-2" />
            Übernehmen
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
