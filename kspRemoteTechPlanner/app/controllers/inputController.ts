﻿/// <reference path="../_references.ts" />

namespace App {
    'use strict';

    export class InputController {
        sc: SatChain;
        settings: Settings;

        static $inject = ["settingsServ", "eventServ", "satChainServ", "bodyDictServ", "antennaDictServ"];
        constructor(
            private settingsServ: SettingsService,
            private eventServ: EventService,
            private satChainServ: SatChainService,
            private bodies: BodyDictionaryService,
            private antennas: AntennaDictionaryService
            ) {

            this.sc = this.satChainServ.satChain;
            this.settings = this.settingsServ.settings;
            this.onChange();
        }

        isSelectedAntenna(index: number): boolean {
            return this.sc.antennaIndex === index;
        }

        onChange() {
            this.satChainServ.save();
            this.sc.updateMam(this.settings.multipleAntennaMultiplier);
            this.eventServ.updateView();
        }

        onBodyChange() {
            this.eventServ.updateBody();
            this.onChange();
        }

        onAntennaChange() {
            this.eventServ.updateAntenna();
            this.onChange();
        }

        setAntennaIndex(index: number) {
            this.sc.antennaIndex = index;
            this.onChange();
        }

        onAddAntenna() {
            this.sc.antennas.push({ antenna: this.antennas.get("Reflectron DP-10"), quantity: 1 });
            this.onAntennaChange();
        }

        onRemoveSelectedAntenna() {
            this.sc.antennas.splice(this.sc.antennaIndex, 1);
            if (this.sc.antennaIndex === this.sc.antennas.length)
                this.sc.antennaIndex--;
            this.onAntennaChange();
        }
    }
}
