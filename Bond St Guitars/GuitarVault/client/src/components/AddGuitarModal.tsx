import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertGuitarSchema, type InsertGuitar } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ObjectUploader } from "@/components/ObjectUploader";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Upload } from "lucide-react";
import type { UploadResult } from "@uppy/core";

interface AddGuitarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddGuitarModal({ isOpen, onClose }: AddGuitarModalProps) {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertGuitar>({
    resolver: zodResolver(insertGuitarSchema),
    defaultValues: {
      brand: "",
      model: "",
      type: "electric",
      year: new Date().getFullYear(),
      condition: "new",
      color: "",
      price: 0,
      pickupLocation: "",
      description: "",
      status: "available",
      imageUrl: "",
      imageUrls: [],
    },
  });

  const createGuitarMutation = useMutation({
    mutationFn: async (data: InsertGuitar) => {
      const response = await apiRequest("POST", "/api/guitars", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guitars"] });
      toast({
        title: "Guitar added successfully",
        description: "The guitar has been added to your inventory.",
      });
      onClose();
      form.reset();
      setUploadedImages([]);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add guitar. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGetUploadParameters = async () => {
    const response = await fetch("/api/objects/upload", {
      method: "POST",
      credentials: "include",
    });
    
    if (!response.ok) {
      throw new Error("Failed to get upload URL");
    }
    
    const { uploadURL } = await response.json();
    return {
      method: "PUT" as const,
      url: uploadURL,
    };
  };

  const handleUploadComplete = (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    const newImageUrls = result.successful?.map(file => file.uploadURL as string) || [];
    setUploadedImages(prev => [...prev, ...newImageUrls]);
    
    // Set the first image as the primary image
    if (newImageUrls.length > 0 && !form.getValues("imageUrl")) {
      form.setValue("imageUrl", newImageUrls[0]);
    }
    
    // Add all images to the imageUrls array
    const currentImageUrls = form.getValues("imageUrls") || [];
    form.setValue("imageUrls", [...currentImageUrls, ...newImageUrls]);
  };

  const onSubmit = (data: InsertGuitar) => {
    createGuitarMutation.mutate(data);
  };

  const handleClose = () => {
    if (!createGuitarMutation.isPending) {
      onClose();
      form.reset();
      setUploadedImages([]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">Add New Guitar</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Fender, Gibson, Martin" 
                        {...field} 
                        data-testid="input-brand"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Stratocaster, Les Paul" 
                        {...field} 
                        data-testid="input-model"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="electric">Electric</SelectItem>
                        <SelectItem value="acoustic">Acoustic</SelectItem>
                        <SelectItem value="classical">Classical</SelectItem>
                        <SelectItem value="bass">Bass</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1900" 
                        max={new Date().getFullYear() + 1}
                        {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        data-testid="input-year"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="condition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condition</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-condition">
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="excellent">Excellent</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="fair">Fair</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color/Finish</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Sunburst, Natural, Black" 
                        {...field} 
                        data-testid="input-color"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        step="0.01"
                        placeholder="1299.99" 
                        {...field} 
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        data-testid="input-price"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="Pick up or Delivery"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pickup Location</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-pickup-location">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Pick up">Pick up</SelectItem>
                      <SelectItem value="Delivery">Delivery</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Detailed description of the guitar, including any special features or condition notes..."
                      rows={4}
                      {...field}
                      value={field.value || ""}
                      data-testid="textarea-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Guitar Images</FormLabel>
              <div className="mt-2">
                <ObjectUploader
                  maxNumberOfFiles={5}
                  maxFileSize={10485760} // 10MB
                  onGetUploadParameters={handleGetUploadParameters}
                  onComplete={handleUploadComplete}
                  buttonClassName="w-full border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors"
                >
                  <div className="flex flex-col items-center">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-foreground font-medium mb-1">Upload guitar images</p>
                    <p className="text-sm text-muted-foreground">
                      Support for multiple images (JPG, PNG, WebP)
                    </p>
                  </div>
                </ObjectUploader>
              </div>
              
              {uploadedImages.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {uploadedImages.map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={imageUrl}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-24 object-cover rounded border border-border"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                        <span className="text-white text-xs">Preview {index + 1}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-border">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={createGuitarMutation.isPending}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createGuitarMutation.isPending}
                data-testid="button-submit"
              >
                {createGuitarMutation.isPending ? (
                  "Adding..."
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Guitar
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
