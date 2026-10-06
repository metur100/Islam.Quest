/**
 * Config plugin: makes local Android release builds reliable on Windows.
 * The Kotlin compile daemon can crash on large Expo projects ("Unexpected exception thrown"),
 * which leaves Gradle hanging; compiling Kotlin in-process with a larger heap avoids that.
 */
const { withGradleProperties } = require('expo/config-plugins');

const PROPERTIES = {
  'kotlin.compiler.execution.strategy': 'in-process',
  'org.gradle.jvmargs': '-Xmx4g -XX:MaxMetaspaceSize=1g -Dfile.encoding=UTF-8',
};

module.exports = function withStableAndroidBuild(config) {
  return withGradleProperties(config, (cfg) => {
    for (const [key, value] of Object.entries(PROPERTIES)) {
      const existing = cfg.modResults.find((item) => item.type === 'property' && item.key === key);
      if (existing) existing.value = value;
      else cfg.modResults.push({ type: 'property', key, value });
    }
    return cfg;
  });
};
