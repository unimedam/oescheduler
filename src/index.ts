import OEScheduler from './core/OEScheduler';

const scheduler = new OEScheduler();

scheduler.assign("Day", { 
    run: "expbenef.p",
    startDate: "22/06/2020 13:16"
});