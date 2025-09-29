import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { ArrowLeft, MapPin, Clock, DollarSign, Palette, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Guitar } from "@shared/schema";

function GuitarDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: guitar, isLoading, error } = useQuery<Guitar>({
    queryKey: ["/api/guitars", id],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-amber-200 dark:bg-amber-800 rounded-md w-32 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-amber-200 dark:bg-amber-800 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-amber-200 dark:bg-amber-800 rounded-md w-3/4"></div>
                <div className="h-6 bg-amber-200 dark:bg-amber-800 rounded-md w-1/2"></div>
                <div className="h-20 bg-amber-200 dark:bg-amber-800 rounded-md"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !guitar) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20">
        <div className="container mx-auto px-4 py-8">
          <Link href="/" className="inline-flex items-center gap-2 text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to Inventory
          </Link>
          <Card>
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold text-amber-900 dark:text-amber-100 mb-4">Guitar Not Found</h1>
              <p className="text-amber-700 dark:text-amber-300 mb-6">The guitar you're looking for doesn't exist or may have been removed.</p>
              <Link href="/">
                <Button>Browse All Guitars</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(price));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'sold':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'new':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'excellent':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'good':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'fair':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20">
      <div className="container mx-auto px-4 py-8">
        {/* Back Navigation */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 mb-6 transition-colors"
          data-testid="link-back-inventory"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Inventory
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Section */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <div className="aspect-square bg-gradient-to-br from-amber-100 to-orange-200 dark:from-amber-800/50 dark:to-orange-800/50 rounded-lg overflow-hidden">
                  {guitar.imageUrl ? (
                    <img 
                      src={guitar.imageUrl} 
                      alt={`${guitar.brand} ${guitar.model}`}
                      className="w-full h-full object-cover"
                      data-testid="img-guitar-primary"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-amber-600 dark:text-amber-400">
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-200 dark:bg-amber-700 flex items-center justify-center">
                          <span className="text-2xl">🎸</span>
                        </div>
                        <p className="text-sm">No image available</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Additional Images */}
            {guitar.imageUrls && guitar.imageUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {guitar.imageUrls.map((url, index) => (
                  <div 
                    key={index} 
                    className="aspect-square bg-gradient-to-br from-amber-100 to-orange-200 dark:from-amber-800/50 dark:to-orange-800/50 rounded-lg overflow-hidden"
                  >
                    <img 
                      src={url} 
                      alt={`${guitar.brand} ${guitar.model} - Image ${index + 1}`}
                      className="w-full h-full object-cover"
                      data-testid={`img-guitar-additional-${index}`}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-3xl font-serif text-amber-900 dark:text-amber-100" data-testid="text-guitar-title">
                      {guitar.brand} {guitar.model}
                    </CardTitle>
                    <CardDescription className="text-lg text-amber-700 dark:text-amber-300 mt-2">
                      {guitar.type.charAt(0).toUpperCase() + guitar.type.slice(1)} Guitar
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(guitar.status)} data-testid="badge-guitar-status">
                    {guitar.status.charAt(0).toUpperCase() + guitar.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Price */}
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  <span className="text-3xl font-bold text-amber-900 dark:text-amber-100" data-testid="text-guitar-price">
                    {formatPrice(guitar.price)}
                  </span>
                </div>

                <Separator />

                {/* Specifications */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <span className="text-sm font-medium text-amber-800 dark:text-amber-200">Year:</span>
                    <span className="text-sm text-amber-700 dark:text-amber-300" data-testid="text-guitar-year">{guitar.year}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getConditionColor(guitar.condition)} data-testid="badge-guitar-condition">
                      {guitar.condition.charAt(0).toUpperCase() + guitar.condition.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <span className="text-sm font-medium text-amber-800 dark:text-amber-200">Color:</span>
                    <span className="text-sm text-amber-700 dark:text-amber-300" data-testid="text-guitar-color">{guitar.color}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <span className="text-sm font-medium text-amber-800 dark:text-amber-200">Pickup:</span>
                    <span className="text-sm text-amber-700 dark:text-amber-300" data-testid="text-guitar-pickup">{guitar.pickupLocation}</span>
                  </div>
                </div>

                {/* Description */}
                {guitar.description && (
                  <>
                    <Separator />
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        <span className="font-medium text-amber-800 dark:text-amber-200">Description</span>
                      </div>
                      <p className="text-amber-700 dark:text-amber-300 leading-relaxed" data-testid="text-guitar-description">
                        {guitar.description}
                      </p>
                    </div>
                  </>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  {guitar.status === 'available' && (
                    <Button 
                      className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                      data-testid="button-inquire"
                    >
                      Inquire About This Guitar
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    className="border-amber-600 text-amber-600 hover:bg-amber-50 dark:border-amber-400 dark:text-amber-400 dark:hover:bg-amber-900/20"
                    data-testid="button-contact"
                  >
                    Contact Seller
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GuitarDetailPage;