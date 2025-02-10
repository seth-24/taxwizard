import { useState, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Scan, Maximize2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

export default function DocumentScanner() {
  const { toast } = useToast();
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [hasRequestedPermission, setHasRequestedPermission] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: documents } = useQuery({
    queryKey: ["/api/documents"],
  });

  const uploadMutation = useMutation({
    mutationFn: async (imageData: string) => {
      const res = await apiRequest("POST", "/api/documents", {
        image: imageData,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });
      if (isCameraActive) {
        stopCamera();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const checkCameraPermission = async () => {
    try {
      const permissionStatus = await navigator.permissions.query({ name: 'camera' as PermissionName });
      return permissionStatus.state === 'granted';
    } catch (error) {
      return false;
    }
  };

  const startCamera = async () => {
    try {
      setHasRequestedPermission(true);
      const hasPermission = await checkCameraPermission();

      if (!hasPermission) {
        toast({
          title: "Camera Permission Required",
          description: "Please allow camera access when prompted by your browser.",
          variant: "default",
        });
      }

      const constraints = {
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error('Camera access error:', err);
      toast({
        title: "Camera Error",
        description: hasRequestedPermission
          ? "Camera access was denied. Please enable it in your browser settings."
          : "Unable to access camera. Please try uploading a file instead.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (!context) return;

      // Get the video dimensions
      const { videoWidth, videoHeight } = videoRef.current;

      // Set canvas size to match video
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      // Draw the video frame to canvas
      context.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight);

      try {
        // Convert to JPEG with reduced quality for smaller file size
        const imageData = canvasRef.current.toDataURL('image/jpeg', 0.7);
        uploadMutation.mutate(imageData);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to capture image. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        uploadMutation.mutate(reader.result);
      }
    };
    reader.onerror = () => {
      toast({
        title: "Error",
        description: "Failed to read file. Please try again.",
        variant: "destructive",
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Document Scanner</CardTitle>
          <CardDescription>
            Scan and organize your tax documents. Align your document within the guides for best results.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isCameraActive ? (
              <div className="space-y-4">
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full max-w-xl mx-auto rounded-lg border"
                  />
                  {/* Scanning Guide Overlay */}
                  <div className="absolute inset-0 border-2 border-dashed border-primary/50 m-8 pointer-events-none">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Maximize2 className="w-12 h-12 text-primary/30" />
                    </div>
                  </div>
                </div>
                <canvas ref={canvasRef} className="hidden" />
                <div className="flex justify-center gap-4">
                  <Button onClick={captureImage} disabled={uploadMutation.isPending}>
                    <Camera className="mr-2 h-4 w-4" />
                    Capture
                  </Button>
                  <Button
                    variant="outline"
                    onClick={stopCamera}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex justify-center gap-4">
                <Button onClick={startCamera}>
                  <Scan className="mr-2 h-4 w-4" />
                  Start Scanner
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Document
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {documents && documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Scanned Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>File Name</TableHead>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc: any) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      {new Date(doc.documentDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{doc.category}</TableCell>
                    <TableCell>{doc.fileName}</TableCell>
                    <TableCell>{doc.fileType}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}