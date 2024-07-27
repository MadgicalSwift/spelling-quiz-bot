import * as Mixpanel from 'mixpanel';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MixpanelService {
  private mixpanel: any;

  constructor() {
    this.mixpanel = Mixpanel.init('b08ceacc06c6d3b223f8032825964160', {
      protocol: 'http',
    });
  }

  public track(eventName: string, action: any = {}): void {
    this.mixpanel.track(eventName, action);
  }
}