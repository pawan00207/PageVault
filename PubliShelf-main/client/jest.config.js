export default {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.[jt]sx?$": [
      "babel-jest",
      {
        presets: [
          ["@babel/preset-env", { targets: { node: "current" } }],
          ["@babel/preset-react", { runtime: "automatic" }]
        ]
      }
    ]
  },
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "\\.(gif|ttf|eot|svg|png|jpg|jpeg|webp)$": "<rootDir>/src/__tests__/__mocks__/fileMock.js",
    "^(\\.{1,2}/.*)\\.js$": "$1"
  },
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],
  testMatch: ["<rootDir>/src/__tests__/**/*.test.{js,jsx}"],
  collectCoverageFrom: [
    "src/components/**/*.{js,jsx}",
    "src/pages/**/*.{js,jsx}",
    "src/services/**/*.{js,jsx}",
    "src/store/**/*.{js,jsx}",
    "src/hooks/**/*.{js,jsx}",
    "!src/**/index.{js,jsx}"
  ],
  coverageDirectory: "coverage",
  coverageThreshold: {
    global: {
      statements: 55,
      branches: 45,
      functions: 55,
      lines: 55
    }
  }
};
