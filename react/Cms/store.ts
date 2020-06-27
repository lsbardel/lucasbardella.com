import { HttpClient } from "@metablock/core";
import { action, observable } from "mobx";

export class CmsStore {
  cli: HttpClient;

  @observable inProgress = false;
  @observable error?: any = undefined;
  @observable data: Record<string, any> = {};

  constructor() {
    this.cli = new HttpClient();
  }

  @action
  async get(path: string): Promise<any> {
    this.inProgress = true;
    this.error = undefined;
    try {
      if (!this.data[path]) {
        const response = await this.cli.get(path);
        this.data[path] = response.data;
      }
      return this.data[path];
    } catch (error) {
      this.error = error;
    } finally {
      this.inProgress = false;
    }
  }
}

export default new CmsStore();
