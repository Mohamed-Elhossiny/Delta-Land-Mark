import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home/home').then((m) => m.Home),
  },
  {
    path: 'brands',
    loadComponent: () => import('./features/brands/brands/brands').then((m) => m.Brands),
  },
  {
    path: 'floor-plan',
    loadComponent: () => import('./features/floor-plan/floor-plan/floor-plan').then((m) => m.FloorPlan),
  },
  {
    path: 'photos',
    loadComponent: () => import('./features/photos/photos/photos').then((m) => m.Photos),
  },
  {
    path: 'integrated-experience',
    loadComponent: () =>
      import('./features/integrated-experience/integrated-experience/integrated-experience').then(
        (m) => m.IntegratedExperience
      ),
  },
  { path: '**', redirectTo: '' },
];
