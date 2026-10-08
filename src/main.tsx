import { versionFromUrl } from './versioning/versions'

// Each version is loaded on its own so only its stylesheet reaches the page.
const loaders = {
  v1: () => import('./v1/main'),
  v2: () => import('./v2/main'),
}

const version = versionFromUrl(window.location.search)

loaders[version]().then(({ mount }) => mount(document.getElementById('root')!))

