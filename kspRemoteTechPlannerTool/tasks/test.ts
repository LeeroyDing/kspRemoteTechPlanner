﻿/// <reference path="../_references.ts" />

'use strict';

import gulp = require("gulp");
var sequence: Function = require("run-sequence");
var connect: any = require("gulp-connect");
var shell: any = require("gulp-shell");

var targetConf: string = "../kspRemoteTechPlannerTest/conf.js";
var targetRoot: string = "../kspRemoteTechPlanner/";
var targetMinifiedRoot: string = "../deploy";

gulp.task("test:wdm-update",
    shell.task("webdriver-manager update")
    );

gulp.task("test:server-start",() => {
    connect.server({
        root: targetRoot,
        port: 8080
    });
});

gulp.task("test-minified:server-start",() => {
    connect.server({
        root: targetMinifiedRoot,
        port: 8080
    });
});

gulp.task("test:server-stop",() => {
    connect.serverClose();
});

gulp.task("test:protractor",
    shell.task("protractor " + targetConf, { ignoreErrors: true })
    );

gulp.task("test",(cb: gulp.ITaskCallback) => {
    sequence(["test:wdm-update", "test:server-start"], "test:protractor", "test:server-stop", cb);
});

gulp.task("test-minified",(cb: gulp.ITaskCallback) => {
    sequence(["test:wdm-update", "test-minified:server-start"], "test:protractor", "test:server-stop", cb);
});
