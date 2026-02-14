import { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { MapPin, Loader2, Home, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { getUserAddresses, type Address } from '@/services/profileService';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const mapContainerStyle = {
  width: '100%',
  height: '400px',
};

const defaultCenter = {
  lat: 26.9124, // Jaipur, Rajasthan
  lng: 75.7873,
};

interface LocationPickerProps {
  open: boolean;
  onClose: () => void;
  onSelectLocation: (location: { address: string; lat: number; lng: number }) => void;
}

export const LocationPicker = ({ open, onClose, onSelectLocation }: LocationPickerProps) => {
  const { user } = useAuth();
  const [markerPosition, setMarkerPosition] = useState(defaultCenter);
  const [address, setAddress] = useState('');
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);

  // Fetch user's saved addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      if (user && open) {
        setIsLoadingAddresses(true);
        try {
          const response = await getUserAddresses();
          setSavedAddresses(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
          console.error('Error fetching addresses:', error);
        } finally {
          setIsLoadingAddresses(false);
        }
      }
    };
    fetchAddresses();
  }, [user, open]);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  });

  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setMarkerPosition({ lat, lng });
      getAddressFromLatLng(lat, lng);
    }
  }, []);

  const getAddressFromLatLng = async (lat: number, lng: number) => {
    setIsLoadingAddress(true);
    try {
      const geocoder = new google.maps.Geocoder();
      const response = await geocoder.geocode({ location: { lat, lng } });
      
      if (response.results[0]) {
        setAddress(response.results[0].formatted_address);
      }
    } catch (error) {
      console.error('Error getting address:', error);
    } finally {
      setIsLoadingAddress(false);
    }
  };

  const handleSearchLocation = async () => {
    if (!address.trim()) return;

    setIsLoadingAddress(true);
    try {
      const geocoder = new google.maps.Geocoder();
      const response = await geocoder.geocode({ address });
      
      if (response.results[0]) {
        const location = response.results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();
        setMarkerPosition({ lat, lng });
        setAddress(response.results[0].formatted_address);
      }
    } catch (error) {
      console.error('Error searching location:', error);
    } finally {
      setIsLoadingAddress(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLoadingAddress(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setMarkerPosition({ lat, lng });
          getAddressFromLatLng(lat, lng);
        },
        (error) => {
          console.error('Error getting current location:', error);
          setIsLoadingAddress(false);
        }
      );
    }
  };

  const handleSelectSavedAddress = (savedAddress: Address) => {
    const fullAddress = `${savedAddress.address}, ${savedAddress.locality}, ${savedAddress.city}, ${savedAddress.state} - ${savedAddress.pincode}`;
    setAddress(fullAddress);
    // Try to geocode the address to get lat/lng
    handleSearchAddressForSaved(fullAddress);
  };

  const handleSearchAddressForSaved = async (addressText: string) => {
    setIsLoadingAddress(true);
    try {
      const geocoder = new google.maps.Geocoder();
      const response = await geocoder.geocode({ address: addressText });
      
      if (response.results[0]) {
        const location = response.results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();
        setMarkerPosition({ lat, lng });
      }
    } catch (error) {
      console.error('Error geocoding address:', error);
    } finally {
      setIsLoadingAddress(false);
    }
  };

  const handleConfirm = () => {
    onSelectLocation({
      address,
      lat: markerPosition.lat,
      lng: markerPosition.lng,
    });
    onClose();
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Select Your Location</DialogTitle>
          <DialogDescription>
            Click on the map or search for your location
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Saved Addresses */}
          {user && savedAddresses.length > 0 && (
            <div className="border rounded-lg p-3 bg-gray-50">
              <p className="text-sm font-semibold text-gray-700 mb-2">Saved Addresses</p>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {savedAddresses.map((addr) => (
                  <button
                    key={addr._id}
                    onClick={() => handleSelectSavedAddress(addr)}
                    className="w-full text-left p-2 rounded border border-gray-200 bg-white hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      {addr.addressType === 'home' ? (
                        <Home className="w-4 h-4 text-blue-600 mt-0.5" />
                      ) : (
                        <Briefcase className="w-4 h-4 text-purple-600 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{addr.name}</p>
                        <p className="text-xs text-gray-600 truncate">
                          {addr.address}, {addr.locality}, {addr.city} - {addr.pincode}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Input
              placeholder="Search for a location..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearchLocation()}
              className="flex-1"
            />
            <Button 
              onClick={handleSearchLocation}
              disabled={isLoadingAddress}
              variant="outline"
            >
              {isLoadingAddress ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Search'
              )}
            </Button>
            <Button 
              onClick={handleUseCurrentLocation}
              disabled={isLoadingAddress}
              variant="outline"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Use Current
            </Button>
          </div>

          <div className="rounded-lg overflow-hidden border">
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={markerPosition}
              zoom={15}
              onClick={onMapClick}
            >
              <Marker position={markerPosition} />
            </GoogleMap>
          </div>

          {address && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Selected Address:</p>
              <p className="font-medium">{address}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!address}
            className="bg-blue-900 hover:bg-blue-800"
          >
            Confirm Location
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
