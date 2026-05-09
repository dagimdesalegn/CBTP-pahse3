import { Link } from 'react-router-dom'
import { Check, ShoppingCart } from 'lucide-react'
import { Button, ProductImage, StockBadge } from './ui'
import { formatBirr } from '../utils/currency'
import { useLanguage } from '../context/LanguageContext'

export default function ProductCard({ product, onAddToCart, disabledReason, cartQuantity = 0 }) {
  const { t, productName, productDescription, categoryLabel } = useLanguage()
  const isDisabled = product.quantity === 0 || Boolean(disabledReason)
  const isAdded = cartQuantity > 0
  const effectivePrice = Number(product.effective_price ?? product.discount_price ?? product.price)
  const hasDiscount = product.discount_price && Number(product.discount_price) < Number(product.price)
  const name = productName(product)
  const description = productDescription(product)

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <Link to={`/member/products/${product.id}`} className="block focus:outline-none focus:ring-2 focus:ring-amber-400" aria-label={name}>
        <ProductImage product={product} className="h-28 sm:h-40 lg:h-44" />
      </Link>
      <div className="flex flex-1 flex-col p-2.5 sm:p-4">
        <div className="mb-1.5 flex items-center justify-between gap-1.5 sm:mb-2">
          <span className="min-w-0 truncate text-[10px] font-bold uppercase text-slate-500 sm:text-xs">{categoryLabel(product.category)}</span>
          <span className="shrink-0 scale-90 sm:scale-100">
            <StockBadge quantity={product.quantity} />
          </span>
        </div>
        <Link to={`/member/products/${product.id}`} className="line-clamp-2 min-h-[38px] text-[13px] font-black leading-tight text-slate-950 hover:text-amber-700 sm:min-h-[44px] sm:text-base">
          {name}
        </Link>
        <p className="mt-1.5 line-clamp-2 min-h-[34px] text-[11px] leading-4 text-slate-600 sm:mt-2 sm:min-h-[40px] sm:text-sm sm:leading-5">
          {description || t('products.qualityFallback')}
        </p>
        <div className="mt-3 flex items-end justify-between gap-2 sm:mt-4 sm:gap-3">
          <div>
            <p className="text-[10px] font-semibold text-slate-500 sm:text-xs">{t('products.memberPrice')}</p>
            <p className="text-lg font-black leading-none text-slate-950 sm:text-2xl">{formatBirr(effectivePrice)}</p>
            {hasDiscount && <p className="mt-1 text-[10px] font-bold text-slate-400 line-through sm:text-xs">{formatBirr(product.price)}</p>}
          </div>
          <p className="text-right text-[10px] font-semibold leading-tight text-slate-500 sm:text-xs">{product.quantity} {t('products.available')}</p>
        </div>
        <Button
          onClick={() => onAddToCart(product)}
          disabled={isDisabled}
          title={disabledReason || undefined}
          variant={isAdded ? 'secondary' : 'primary'}
          className="mt-3 w-full px-2 py-2 text-[11px] sm:mt-4 sm:px-4 sm:py-2.5 sm:text-sm"
        >
          {isAdded ? <Check size={14} className="sm:h-[17px] sm:w-[17px]" /> : <ShoppingCart size={14} className="sm:h-[17px] sm:w-[17px]" />}
          {disabledReason ? t('products.verifyToBuy') : product.quantity === 0 ? t('products.unavailable') : isAdded ? t('products.added') : t('products.addToCart')}
        </Button>
        {disabledReason && <p className="mt-2 text-[10px] font-semibold leading-4 text-amber-700 sm:text-xs">{t('products.verificationRequired')}</p>}
      </div>
    </article>
  )
}
