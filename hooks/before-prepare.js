"use strict";

const fs = require("fs");
const path = require("path");

module.exports = ($projectData, $pluginVariablesHelper, $logger) => {
    const nativescriptConfig = JSON.parse(fs.readFileSync($projectData.projectFilePath).toString());
    const pluginConfig = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "package.json")).toString());
    const pluginVars = nativescriptConfig.nativescript[`${pluginConfig.name}-variables`];

    Object.keys(pluginVars).forEach(k => {
        const v = $pluginVariablesHelper.getPluginVariableFromVarOption(k);
        pluginVars[k] = v ? v[k] : pluginVars[k];
    });

    const inputFileName = path.join(pluginVars.InputDir, `env.${pluginVars.Stage}.json`);
    if (!fs.existsSync(inputFileName)) {
        $logger.warn(`Input file ${inputFileName} does not exist.`);
        return;
    }

    const input = fs.readFileSync(inputFileName).toString();
    const envVars = JSON.parse(input);

    if (!fs.existsSync(pluginVars.OutputDir)) {
        fs.mkdirSync(pluginVars.OutputDir);
    }

    const outputFileName = path.join(pluginVars.OutputDir, "env.json");
    if (fs.existsSync(outputFileName)) {
        const currentContent = fs.readFileSync(outputFileName).toString();
        if (currentContent == input) {
            $logger.info("Env file not changed.");
            return;
        }
    }

    $logger.info("Writing env file.");
    fs.writeFileSync(outputFileName, JSON.stringify(envVars, null, 2));
};
