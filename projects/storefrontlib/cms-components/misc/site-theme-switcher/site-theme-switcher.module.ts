import { CommonModule } from '@angular/common';
import { Injector, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  CmsConfig,
  ContextServiceMap,
  provideDefaultConfig,
  SiteContextModule,
} from '@spartacus/core';
import { CmsComponentData } from '../../../cms-structure/page/model/cms-component-data';
import { IconModule } from '../icon/index';
import { LanguageCurrencyComponent } from '../site-context-selector/language-currency.component';

// import { SiteContextComponentService } from '../site-context-selector/site-context-component.service';
// import { SiteContextSelectorComponent } from '../site-context-selector/site-context-selector.component';
import { SiteThemeSwitcherComponent } from './site-theme-switcher.component';

@NgModule({
  imports: [CommonModule, RouterModule, SiteContextModule, IconModule],
  providers: [
    // provideDefaultConfig(<CmsConfig>{
    //   cmsComponents: {
    //     CMSSiteContextComponent: {
    //       component: SiteContextSelectorComponent,
    //       providers: [
    //         {
    //           provide: SiteThemeSwitcherComponent,
    //           useClass: SiteThemeSwitcherComponent,
    //           deps: [CmsComponentData, ContextServiceMap, Injector],
    //         },
    //       ],
    //     },
    //     LanguageCurrencyComponent: {
    //       component: LanguageCurrencyComponent,
    //     },
    //   },
    // }),
    // SiteThemeSwitcherComponent,
  ],
  //   declarations: [SiteContextSelectorComponent, SiteThemeSwitcherComponent],
  exports: [SiteThemeSwitcherComponent],
})
export class ThemeSwitcherModule {}
