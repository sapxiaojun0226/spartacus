import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SiteContext } from '@spartacus/core';
// import { Observable } from 'rxjs';
import { ICON_TYPE } from '../icon/icon.model';
// import { SiteContextComponentService } from './site-context-component.service';
import { SiteTheme } from './site-theme.model';
@Component({
  selector: 'cx-site-theme-switcher',
  templateUrl: './site-theme-switcher.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteThemeSwitcherComponent {
  siteContextService: SiteContext<any>;
  iconTypes = ICON_TYPE;

  @Input() theme: SiteTheme;
}
