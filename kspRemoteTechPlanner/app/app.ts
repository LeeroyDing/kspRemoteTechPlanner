﻿/// <reference path="references.ts" />

// startup
$(() => {
    App.init();
});

module App {
    'use strict';

    // values
    var satellites: Satellites;
    var body: Body;
    var antenna: Antenna;
    var input: InputData;

    var viewEntire: EntireView;
    var viewNight: NightView;
    var viewDeltav: DeltavView;

    // method definitions
    export function init() {
        // init values
        satellites = new Satellites();
        body = satellites.body;
        antenna = satellites.antenna;
        input = new InputData(satellites);

        // init views
        viewEntire = new EntireView(new createjs.Stage($("canvas#entire")[0]), 10000, 840);
        viewEntire.satellites = satellites;

        viewNight = new NightView(new createjs.Stage($("canvas#night")[0]), 5000, 400);
        viewNight.satellites = satellites;

        viewDeltav = new DeltavView(new createjs.Stage($("canvas#deltav")[0]), 5000, 400);
        viewDeltav.satellites = satellites;

        // load user data
        var cookieExists: UserData.loadCookieResult = UserData.loadCookie();
        if (cookieExists.body) {
            for (var i in UserData.userBodies) {
                addUserDataSelection("body", UserData.userBodies[i].name);
            }
        }
        if (cookieExists.antenna) {
            for (var i in UserData.userAntennas) {
                addUserDataSelection("antenna", UserData.userAntennas[i].name);
            }
        }

        // set validator
        $("form#calculator").validate({
            highlight: function (element) { $(element).parent("div").addClass("has-error") },
            unhighlight: function (element) { $(element).parent("div").removeClass("has-error") }
        });

        // add event handlers
        $("select#body").change(onBodySelect);
        $("button.manual-input#body_detail").click((ev) => { $("div.manual-input#manual_body").slideToggle() });
        $("button.manual-input#body_reset").click((ev) => { onBodySelect(ev) });

        $("button.manual-input#body_add").click(onUserBodyAdd);
        $("button.manual-input#body_remove").click(onUserBodyRemove);

        $("select#antenna").change(onAntennaSelect);
        $("button.manual-input#antenna_detail").click((ev) => { $("div.manual-input#manual_antenna").slideToggle() });
        $("button.manual-input#antenna_reset").click((ev) => { onAntennaSelect(ev) });

        $("button.manual-input#antenna_add").click(onUserAntennaAdd);
        $("button.manual-input#antenna_remove").click(onUserAntennaRemove);

        $("form#calculator").find("input,select").keypress((ev) => { if (ev.keyCode == 13 && validate()) update() });
        $("button#calculate").click((ev) => { if (validate()) update() });
        $("button#reset").click((ev) => { reset() });

        // finallize
        reset();
        update();
    }

    function update() {
        input.pull();

        viewEntire.innerSize = (body.radius + satellites.altitude + antenna.range) * 2 * 1.05;
        viewEntire.show();
        viewNight.show();
        viewDeltav.show();
    }


    function reset() {
        input.reset();

        onBodySelect(null);
        onAntennaSelect(null);
    }

    function validate(): boolean {
        return validateBody() && validateAntenna() && $("input#count,input#altitude,input#elcConsumption").valid();
    }

    function validateBody(): boolean {
        return $("div.manual-input#manual_body").children("div").children("input").valid();
    }

    function validateAntenna(): boolean {
        return $("div.manual-input#manual_antenna").children("div").children("input").valid();
    }

    // event handler
    // retrieve data of selected body.
    function onBodySelect(ev) {
        var b: Body;
        if ($("select#body > optgroup[label='User data']").length == 1) // when option group User data exists,
            b = UserData.userBodies[$("select#body").val()];            // aquire data from UserData first,
        if (b == undefined)                               // if undefined there or option group User data not exists,
            b = BodyData.getBody($("select#body").val()); // then from BodyData.

        satellites.body.name = b.name;
        satellites.body.color = b.color;
        satellites.body.radius = b.radius;
        satellites.body.stdGravParam = b.stdGravParam;
        satellites.body.soi = b.soi;
        input.pushBody();

        validateBody(); // execute validation with loaded value to clear validate state.
    }

    // add new data to user's body
    function onUserBodyAdd(ev) {
        if (validateBody())
            input.pullBody();
        else
            return;

        if (UserData.userBodies[body.name] == undefined) // if the same name body is not defined yet,
            addUserDataSelection("body", body.name);     // add option to body selector.
        $("select#body").val(body.name);

        var b: Body = new Body(body.name, body.color, body.radius, body.stdGravParam, body.soi); // create new instance and put data.
        UserData.userBodies[body.name] = b;
        UserData.saveCookie();
    }

    // remove user's body data which has the same name as body_name in body_detail.
    function onUserBodyRemove(ev) {
        if ($("input#body_name").valid())
            delete UserData.userBodies[$("input#body_name").val()];
        else
            return;
        UserData.saveCookie();
        removeUserDataSelection("body", $("input#body_name").val(), () => { return UserData.loadCookie().body });
    }

    // retrieve data of selected antenna.
    function onAntennaSelect(ev) {
        var a: Antenna;
        if ($("select#antenna > optgroup[label='User data']").length == 1) // when option group User data exists,
            a = UserData.userAntennas[$("select#antenna").val()];          // aquire data from UserData first,
        if (a == undefined)                                        // if undefined there or option group User data not exists,
            a = AntennaData.getAntenna($("select#antenna").val()); // then from AntennaData.

        satellites.antenna.name = a.name;
        satellites.antenna.type = a.type;
        satellites.antenna.range = a.range;
        satellites.antenna.elcConsumption = a.elcConsumption;
        input.pushAntenna();

        validateAntenna(); // execute validation with loaded value to clear validate state.
    }

    // add new data to user's antenna
    function onUserAntennaAdd(ev) {
        if (validateAntenna())
            input.pullAntenna();
        else
            return;

        if (UserData.userAntennas[antenna.name] == undefined) // if the same name antenna is not defined yet,
            addUserDataSelection("antenna", antenna.name);    // add option to antenna selector.
        $("select#antenna").val(antenna.name);

        var a: Antenna = new Antenna(antenna.name, antenna.type, antenna.range, antenna.elcConsumption); // create new instance and put data.
        UserData.userAntennas[antenna.name] = a;
        UserData.saveCookie();
    }

    // remove user's antenna data which has the same name as antenna_name in antenna_detail.
    function onUserAntennaRemove(ev) {
        if ($("input#antenna_name").valid())
            delete UserData.userAntennas[$("input#antenna_name").val()];
        else
            return;
        UserData.saveCookie();
        removeUserDataSelection("antenna", $("input#antenna_name").val(), () => {return UserData.loadCookie().antenna });
    }

    // add select option for user's data to selector.
    function addUserDataSelection(data: string, name: string) {
        if ($("select#" + data + " > optgroup[label='User data']").length == 0)    // if there isn't User data option-group,
            $("select#" + data).append("<optgroup label='User data'></optgroup>"); // make one.
        $("select#" + data + " > optgroup[label='User data']").append("<option>" + name + "</option>"); // add option for user's data to selector.
    }

    // remove select option for user's data from selector.
    function removeUserDataSelection(data: string, name: string, isDataRemaining: () => boolean) {
        $("optgroup[label='User data'] > option:contains('" + name + "')").remove();
        if (!isDataRemaining()) {                                            // if there are no user's data left,
            $("select#" + data + " > optgroup[label='User data']").remove(); // remove User data option-group.
        }
    }
}
