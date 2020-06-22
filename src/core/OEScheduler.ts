require('dotenv/config');
const util = require('util');
const exec = util.promisify(require("child_process").exec);
const fs = require("fs");
const path = require('path')

interface taskParamsInterface {
    executed: boolean,
    nextExecution: Date
}

interface Task {
    run: string,
    startDate: string,
}

type EachPeriodType = "Day" | "Week" | "Month" | "Year";

export default class OEScheduler {

    private tickTime: number = 1; //Segundos para verificação
    private scriptsPath: string = "";

    public constructor()
    {

        this.scriptsPath = (process.env.SCRIPTS_LOCATION) ? process.env.SCRIPTS_LOCATION : path.resolve(__dirname, '..', '..', 'scripts');

    }

    /**
     * 
     * Cadastra uma nova tarefa para ser executada.
     * 
     * @param eachPeriod 
     * @param task
     */
    public assign(eachPeriod: EachPeriodType, task: Task): void
    {
        if (!process.env.PROGRESS_EXE || !process.env.PF_FILE) {
            console.error("Verifique se as variaveis de embiente PROGRESS_EXE e PF_FILE estão preenchidas")
            return;
        }

        const startDate = this.parseDate(task.startDate);
        const taskParams: taskParamsInterface = {
            executed: false,
            nextExecution: new Date(startDate)
        }
        
        console.log(`${task.run} Cadastrado\n Próxima execução => ${taskParams.nextExecution?.toLocaleDateString()} ${taskParams.nextExecution?.toLocaleTimeString()}`);

        setInterval(async () => {
               
            const today = new Date();
            
            const atTime = taskParams.nextExecution.getHours() + ":" + taskParams.nextExecution.getMinutes();
            const todayTime = today.getHours() + ":" + today.getMinutes();

            if (atTime === todayTime && !taskParams.executed) {
                
                if (taskParams.nextExecution?.toLocaleDateString() == today.toLocaleDateString()) {
                    console.log(`*** INICIANDO EXECUÇÃO DE SCRIPT ${task.run} ***`)
                    console.log("-- Validando caminho")
                    if (!fs.existsSync(this.scriptsPath + '\\' + task.run)) {
                        console.error("    Script "+ task.run +" não localizado no caminho: " + this.scriptsPath);
                        console.error("    Tarefa abortada, verifique se o script existe e esta localizado na pasta correta.");
                        taskParams.nextExecution.setMinutes(taskParams.nextExecution.getMinutes() + 1);
                        console.info("    Tentativa de proxima execução marcada para o minuto seguinte: ", taskParams.nextExecution);
                        return;
                    }
                    console.log("-- OK");
                    console.log("*** INICIANDO EXECUÇÃO ***");
                    taskParams.executed = true;

                    try { 

                        const { stdin, stderr } = await exec(`${process.env.PROGRESS_EXE} -b -pf ${process.env.PF_FILE} -p ${this.scriptsPath + '\\' + task.run}`);

                        switch(eachPeriod){
                            case "Day":
                                taskParams.nextExecution.setDate(taskParams.nextExecution.getDate() + 1);
                            break;
                            case "Week":
                                taskParams.nextExecution.setDate(taskParams.nextExecution.getDate() + 7);
                            break;
                            case "Month":
                                taskParams.nextExecution.setMonth(taskParams.nextExecution.getMonth() + 1);
                            break;
                            case "Year":
                                taskParams.nextExecution.setFullYear(taskParams.nextExecution.getFullYear() + 1);
                            break;
                        }
                        
                        taskParams.nextExecution.setMinutes(startDate.getMinutes());
                        console.log(`    ${task.run} executada com sucesso, próxima execução => ${taskParams.nextExecution?.toLocaleDateString()} ${taskParams.nextExecution?.toLocaleTimeString()}`);    

                    }catch(err){
                        if (err) {
                            console.error("-- Houve um erro ao executar o script, tafera abortada");
                            console.error("    ", err)
                            return
                        }
                    }

                    
                }

            }else if (atTime !== todayTime && taskParams.executed){

                taskParams.executed = false;

            }

        }, this.tickTime * 1000);
    }
    
    /**
     * 
     * Converte a data para o formato da classe Date( ) e retorna o objeto.
     * 
     * @param dateToParse 
     */
    private parseDate(dateToParse: string): Date
    {

        let date = dateToParse.split(' ')[0];
        let time = dateToParse.split(' ')[1];

        let day = date.split("/")[0];
        let month = date.split("/")[1];
        let year = date.split("/")[2];

        let hour = time.split(":")[0];
        let minutes = time.split(":")[1];

        let today = new Date();

        let newDateFormat = `${month}/${day}/${year} ${time}:00`;
        let newDate = new Date(newDateFormat);

        const dateDiff = newDate.getTime() - today.getTime();
        if (dateDiff > 0) {
            return newDate;
        }else if (dateDiff <= 0 && newDate.toLocaleTimeString() < today.toLocaleTimeString()) {
            today.setDate(today.getDate() + 1);
            let newDateFormat = `${today.toLocaleDateString()} ${time}:00`;
            return new Date(newDateFormat);
        }else {
            let newDateFormat = `${today.toLocaleDateString()} ${time}:00`;
            return new Date(newDateFormat);
        }

    }

}