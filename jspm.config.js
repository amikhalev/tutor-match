SystemJS.config({
    paths: {
        "github:": "jspm/github/",
        "npm:": "jspm/npm/"
    },
    browserConfig: {
        "baseURL": "/static",
        "paths": {
            "client/": "js/client/",
            "common/": "js/common/"
        }
    },
    nodeConfig: {
        "paths": {
            "client/": "client/",
            "common/": "common/"
        }
    },
    devConfig: {
        "map": {
            "css": "github:systemjs/plugin-css@0.1.36"
        }
    },
    transpiler: false,
    meta: {
        "*.css": {
            "loader": "css"
        },
        "npm:bootstrap*/dist/js/*": {
            "format": "global",
            "deps": [
                "jquery",
                "popper.js"
            ],
            "globals": {
                "Popper": "popper.js"
            }
        }
    },
    packages: {
      "js/client": {
        "format": "system",
        "defaultExtension": "js"
      },
      "js/common": {
        "format": "system",
        "defaultExtension": "js"
      },
        "npm:moment@2.19.1": {
            "format": "cjs"
        }
    }
});

SystemJS.config({
    packageConfigPaths: [
        "npm:@*/*.json",
        "npm:*.json",
        "github:*/*.json"
    ],
    map: {
        "bootstrap": "npm:bootstrap@4.0.0-beta.2",
        "eonasdan-bootstrap-datetimepicker": "npm:eonasdan-bootstrap-datetimepicker@4.17.47",
        "font-awesome": "npm:font-awesome@4.7.0",
        "jquery": "npm:jquery@3.2.1",
        "moment": "npm:moment@2.19.2",
        "moment-timezone": "npm:moment-timezone@0.5.14",
        "popper.js": "npm:popper.js@1.12.6"
    },
    packages: {
        "npm:bootstrap@4.0.0-beta.2": {
            "map": {
                "jquery": "npm:jquery@3.2.1",
                "tether": "github:HubSpot/tether@1.4.1"
            }
        },
        "npm:font-awesome@4.7.0": {
            "map": {
                "css": "github:systemjs/plugin-css@0.1.36"
            }
        },
        "npm:eonasdan-bootstrap-datetimepicker@4.17.47": {
            "map": {
                "moment-timezone": "npm:moment-timezone@0.5.14"
            }
        },
        "npm:moment-timezone@0.5.14": {
            "map": {
                "moment": "npm:moment@2.19.2"
            }
        }
    }
});
