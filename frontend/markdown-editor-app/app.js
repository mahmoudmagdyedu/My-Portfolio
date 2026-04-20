// Markdown Editor — basic scaffold
// Uses marked.js (loaded via CDN) for Markdown -> HTML.

(function () {
	const STORAGE_KEY = 'markdown-editor-app:content'
	const THEME_KEY = 'markdown-editor-app:theme'

	const editor = document.getElementById('editor')
	const preview = document.getElementById('preview')
	const toggleTheme = document.getElementById('toggle-theme')
	const downloadBtn = document.getElementById('download')

	function render() {
		if (typeof marked === 'undefined') return
		preview.innerHTML = marked.parse(editor.value || '')
	}

	function save() {
		localStorage.setItem(STORAGE_KEY, editor.value)
	}

	function load() {
		const saved = localStorage.getItem(STORAGE_KEY)
		if (saved !== null) editor.value = saved
	}

	function applyTheme(theme) {
		document.documentElement.setAttribute('data-theme', theme)
		localStorage.setItem(THEME_KEY, theme)
	}

	function wrapSelection(before, after) {
		const start = editor.selectionStart
		const end = editor.selectionEnd
		const selected = editor.value.slice(start, end)
		const replacement = before + selected + (after !== undefined ? after : before)
		editor.setRangeText(replacement, start, end, 'end')
		editor.focus()
		render()
		save()
	}

	const actions = {
		bold: () => wrapSelection('**'),
		italic: () => wrapSelection('*'),
		heading: () => wrapSelection('\n## ', ''),
		link: () => wrapSelection('[', '](https://)'),
		code: () => wrapSelection('`'),
		list: () => wrapSelection('\n- ', ''),
	}

	document.querySelectorAll('[data-action]').forEach((btn) => {
		btn.addEventListener('click', () => {
			const a = btn.getAttribute('data-action')
			if (actions[a]) actions[a]()
		})
	})

	toggleTheme.addEventListener('click', () => {
		const current = document.documentElement.getAttribute('data-theme') || 'light'
		applyTheme(current === 'light' ? 'dark' : 'light')
	})

	downloadBtn.addEventListener('click', () => {
		const blob = new Blob([editor.value], { type: 'text/markdown' })
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = 'document.md'
		document.body.appendChild(a)
		a.click()
		document.body.removeChild(a)
		URL.revokeObjectURL(url)
	})

	editor.addEventListener('input', () => { render(); save() })
	window.addEventListener('load', () => {
		applyTheme(localStorage.getItem(THEME_KEY) || 'light')
		load()
		render()
	})
})()
