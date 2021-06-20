interface RuntimeConfig {
  elementPrefix?: string;
  upperCaseElementPerfix?: string;
  contextPath?: string;
}

interface Window {
  tinyRuntimeConfig: RuntimeConfig;
}
