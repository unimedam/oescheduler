import OEScheduler from './core/OEScheduler';

const scheduler = new OEScheduler();

scheduler.assign("Day", { 
    run: "ExportaBenef.p",
    startDate: "15/06/2020 18:49"
});

scheduler.assign("Day", {
    run: "OutroScript.P",
    startDate: "15/06/2020 20:40"
});