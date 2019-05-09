jest.mock("react-geolocated", () => {
    return {
        geolocated: function(hocConf) {
            return function(component) {
                component.defaultProps = {
                    ...component.defaultProps,
                    isGeolocationAvailable: true,
                    isGeolocationEnabled: true,
                    coords: {
                        accuracy: 130,
                        altitude: null,
                        altitudeAccuracy: null,
                        heading: null,
                        latitude: 10,
                        longitude: 10,
                        speed: null
                     }
                };
                return component;
            };
          }
    };
});