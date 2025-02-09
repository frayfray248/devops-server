import { spawn } from 'child_process';

const runProcess = (command: string, args: string[]): Promise<void> => {

    return new Promise((resolve, reject) => {

        const proc = spawn(command, args);

        let output = ""
        let error = ""

        proc.stdout.on('data', (data) => {
            output += data;
            process.stdout.write(data)
        });

        proc.stderr.on('data', (data) => {
            error += data;
            process.stdout.write(data)
        });

        proc.on('close', (code) => {
            if (code !== 0) {
                reject();
                return;
            }
            resolve();
        });

    });
}

export default runProcess;