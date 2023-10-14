const Core = require("./Core");

const fs = require("fs");

class Parscoders extends Core {



    async lunchBid(skills, repeat, message) {
        const Projects = [];
        let skillName, projectData;

        for (let index_repeat = 1; index_repeat <= repeat; index_repeat++) {
            projectData = await this.getPage(index_repeat);
            Projects.push(projectData);

        }


        for (let index_skill = 0; index_skill < skills.length; index_skill++) {


            skillName = skills[index_skill];
            console.log('SKILL '.red.bold, skillName.green.bold);

            for (let index_repeat = 1; index_repeat <= repeat; index_repeat++) {
                console.log(skillName.green.bold, 'PAGE '.red.bold + index_repeat)
                projectData = await this.getNewProjects(skillName, index_repeat);
                Projects.push(projectData);

            }
        }



        const filteredProjects = Projects.flat(10);


        for (let index_project = 0; index_project < filteredProjects.length; index_project++) {

            let project_obj = await this.fetchBid(filteredProjects[index_project]);

            let price = Math.round(((parseInt(project_obj.maxPrice) * 80) / 100));

            this.FunctionsClass.sleep(250);



            await this.sendBid(project_obj,
                price,
                '25',
                project_obj.deadline,
                '3',
                message,
                project_obj.expertise

            );




    





        }

    }



}


module.exports = Parscoders;