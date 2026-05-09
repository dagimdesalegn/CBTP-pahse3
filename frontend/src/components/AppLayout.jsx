import Navbar from './Navbar'
import AppFooter from './AppFooter'

export default function AppLayout({ children, cartCount, onCartClick, maxWidth = 'max-w-7xl' }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <Navbar cartCount={cartCount} onCartClick={onCartClick} />
      <main className="flex-1 px-3 py-4 pb-24 sm:px-6 sm:py-5 sm:pb-5 lg:px-8">
        <div className={`${maxWidth} mx-auto`}>
          {children}
        </div>
      </main>
      <AppFooter cartCount={cartCount} onCartClick={onCartClick} />
    </div>
  )
}
