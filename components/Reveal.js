// components/Reveal.js
'use client'
import { motion } from 'framer-motion'

export default function Reveal({ children, y = 16, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.45, delay }}
    >
      {children}
    </motion.div>
  )
}
