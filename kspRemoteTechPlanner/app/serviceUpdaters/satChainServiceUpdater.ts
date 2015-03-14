﻿/// <reference path="../appreferences.ts" />

module App {
    export function satChainServiceUpdater(satChain: any, oldVersion: number): SatChain {
        if (oldVersion === undefined) { // update to ver 1.5
            satChain.antennas = [{ antenna: satChain.antenna, quantity: 1 }];
            satChain.antennaIndex = 0;
        }

        return satChain;
    }
}
