import { candidateService } from "../../candidates/services/candidate.service";
import { employeeService } from "../../employees/services/employee.service";

export const reudeyKnowledgeService = {

  async get(intent: string) {

    switch (intent) {

      case "candidate":
        return await candidateService.getCandidatesForAI();

      case "employee":
        return await employeeService.getAll();

      default:
        return [];
    }

  }

};