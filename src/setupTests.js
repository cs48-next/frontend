// react-testing-library renders your components to document.body,
// this will ensure they're removed after each test.
import 'react-testing-library/cleanup-after-each';

// this adds jest-dom's custom assertions
import 'jest-dom/extend-expect';
jest.mock('../src/api');

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