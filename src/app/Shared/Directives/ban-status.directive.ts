import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[appBanStatus]'
})
export class BanStatusDirective {

  constructor(ele:ElementRef) {
    // ele.nativeElement.children[3]
    console.log(ele.nativeElement.children[3].innerhtml)
    console.log(ele)
  }

}
