import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CmsParagraphComponent } from '@spartacus/core';
import { CmsComponentData } from '../../../cms-structure/page/model/cms-component-data';

@Component({
  selector: 'cx-paragraph',
  templateUrl: './paragraph.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParagraphComponent {
  constructor(public component: CmsComponentData<CmsParagraphComponent>) {}

  // sanitizeContent2(content: string) {
  //   let originalString = content;
  //   let newString = originalString.replace('/', '');
  //   return newString;
  // }

  sanitizeContent(data: CmsParagraphComponent) {
    let originalString =
      '<h4 id="test">The following items will be included in the cancellation request. double</h4>';
    let newString = originalString.replace('/', '');
    return (data.content = newString);
  }
}
