﻿/// <reference path="_references.ts" />

module App {
    angular.module("app", ["ngCookies", "LocalStorageModule"])
        .config(
        ["localStorageServiceProvider", (lssp: angular.local.storage.ILocalStorageServiceProvider) => {
            lssp.setPrefix("kspRemoteTechPlanner");
        }])
        .service("eventServ", EventService)
        .service("storageServ", StorageService)
        .service("bodyDictServ", BodyDictionaryService)
        .service("antennaDictServ", AntennaDictionaryService)
        .service("satChainServ", SatChainService)
        .controller("inputCtrl", InputController)
        .controller("entireViewCtrl", EntireViewController)
        .controller("nightViewCtrl", NightViewController)
        .controller("deltavViewCtrl", DeltavViewController)
        .controller("bodyEditCtrl", BodyEditController)
        .controller("antennaEditCtrl", AntennaEditController)
        .filter("antennaType", antennaType)
        .filter("scale", scale);
}
