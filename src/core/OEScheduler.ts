interface taskParamsInterface {
    executed: boolean,
    nextExecution: Date | null
}

interface Task {
    run: string,
    startDate: string,
}

type EachPeriodType = "Day" | "Week" | "Month" | "Year";

export default class OEScheduler {

    private tickTime: number = 1; //Segundos para verificação

    public constructor()
    {

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
        const startDate = this.parseDate(task.startDate);
        const taskParams: taskParamsInterface = {
            executed: false,
            nextExecution: startDate
        }
        
        console.log(`${task.run} Cadastrado\n Próxima execução => ${taskParams.nextExecution?.toLocaleDateString()} ${taskParams.nextExecution?.toLocaleTimeString()}`);

        setInterval(() => {
            
            const today = new Date();
            
            const atTime = taskParams.nextExecution?.getHours() + ":" + taskParams.nextExecution?.getMinutes();
            const todayTime = today.getHours() + ":" + today.getMinutes();

            if (atTime === todayTime && !taskParams.executed) {
                
                if (taskParams.nextExecution?.toLocaleDateString() == today.toLocaleDateString()) {
                    console.log("Executa a tarefa aqui");
                    taskParams.executed = true;

                    switch(eachPeriod){
                        case "Day":
                            taskParams.nextExecution.setMinutes(taskParams.nextExecution.getMinutes() + 1);
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

                    console.log(`${task.run} executada com sucesso, próxima execução => ${taskParams.nextExecution?.toLocaleDateString()} ${taskParams.nextExecution?.toLocaleTimeString()}`);
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