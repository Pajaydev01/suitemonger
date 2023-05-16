import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'list',
    loadChildren: () => import('./popovers/list/list.module').then(m => m.ListPageModule)
  },
  {
    path: 'signup',
    loadChildren: () => import('./modals/signup/signup.module').then(m => m.SignupPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./modals/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'search',
    loadChildren: () => import('./modals/search/search.module').then(m => m.SearchPageModule)
  },
  {
    path: 'searchPage',
    loadChildren: () => import('./search/search.module').then(m => m.SearchPageModule)
  },
  {
    path: 'dpcheck',
    loadChildren: () => import('./popovers/dpcheck/dpcheck.module').then(m => m.DpcheckPageModule)
  },
  {
    path: 'category',
    loadChildren: () => import('./category/category.module').then(m => m.CategoryPageModule)
  },
  {
    path: 'house',
    loadChildren: () => import('./house/house.module').then(m => m.HousePageModule)
  },
  {
    path: 'bookings',
    loadChildren: () => import('./bookings/bookings.module').then(m => m.BookingsPageModule)
  },
  {
    path: 'profile',
    loadChildren: () => import('./profile/profile.module').then(m => m.ProfilePageModule)
  },
  {
    path: 'verify',
    loadChildren: () => import('./modals/verify/verify.module').then(m => m.VerifyPageModule)
  },
  {
    path: 'all',
    loadChildren: () => import('./all/all.module').then(m => m.AllPageModule)
  },
  {
    path: 'notification',
    loadChildren: () => import('./notification/notification.module').then(m => m.NotificationPageModule)
  },
  {
path:'notifiy',
loadChildren:()=>import('./modals/notification/notification.module').then(m=>m.NotificationPageModule)
  },
  {
    path: 'wallet',
    loadChildren: () => import('./wallet/wallet.module').then(m => m.WalletPageModule)
  },
  {
    path: 'history',
    loadChildren: () => import('./modals/history/history.module').then(m => m.HistoryPageModule)
  },
  {
    path: 'booked',
    loadChildren: () => import('./booked/booked.module').then(m => m.BookedPageModule)
  },
  {
    path: 'map',
    loadChildren: () => import('./map/map.module').then(m => m.MapPageModule)
  },
  {
    path: 'place-search',
    loadChildren: () => import('./modals/place-search/place-search.module').then(m => m.PlaceSearchPageModule)
  },
  {
    path: 'place',
    loadChildren: () => import('./place/place.module').then(m => m.PlacePageModule)
  },
  {
    path: 'host',
    loadChildren: () => import('./modals/host/host.module').then(m => m.HostPageModule)
  },
  {
    path: 'marchant',
    loadChildren: () => import('./modals/marchant/marchant.module').then(m => m.MarchantPageModule)
  },
  {
    path: 'topop',
    loadChildren: () => import('./topop/topop.module').then(m => m.TopopPageModule)
  },
  {
    path: 'review',
    loadChildren: () => import('./modals/review/review.module').then(m => m.ReviewPageModule)
  },
  {
    path: 'reviewone',
    loadChildren: () => import('./modals/reviewone/reviewone.module').then(m => m.ReviewonePageModule)
  },
  {
    path: 'imageview',
    loadChildren: () => import('./modals/imageview/imageview.module').then(m => m.ImageviewPageModule)
  },
  {
    path: 'minimap',
    loadChildren: () => import('./modals/minimap/minimap.module').then( m => m.MinimapPageModule)
  },
  {
    path: 'checkout',
    loadChildren: () => import('./modals/checkout/checkout.module').then( m => m.CheckoutPageModule)
  },
  {
    path: 'reciept',
    loadChildren: () => import('./modals/reciept/reciept.module').then( m => m.RecieptPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
