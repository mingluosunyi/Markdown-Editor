// New VueJS instance
new Vue({
  name: 'notebook',

  // CSS selector of the root DOM element
  el: '#notebook',

  // Some data
  data () {
    return {
      // content: 'This is a note',
      notes: JSON.parse(localStorage.getItem('notes')) || [],
      selectedId: localStorage.getItem('selected-id') || null
    }
  },

  // Computed properties
  computed: {
    notePreview () {
      // Markdown rendered to HTML
      return marked.parse(this.selectedNote ? this.selectedNote.content : '')
    },
    addButtonTitle () {
      return this.notes.length + ' note(s) already'
    },
    selectedNote () {
      return this.notes.find( note => note.id === this.selectedId)
    },
    sortedNotes () {
      return this.notes.slice()
          .sort((a, b) => a.created - b.created)
          .sort((a, b) => {
            return (a.favorite === b.favorite) ? 0 : a.favorite ? -1 : 1
          })
    },
    linesCount () {
      if (this.selectedNote) {
        return this.selectedNote.content.split(/\r\n|\r|\n/).length
      }
    },
    wordsCount () {
      if (this.selectedNote) {
        let s = this.selectedNote.content
        s = s.replace(/\n/g,' ')
        s = s.replace(/(^\s*)|(\s*$)/gi,'')
        s = s.replace(/\s\s+/gi,' ')
        return s.split(' ').length
      }
    },
    charactersCount () {
      if (this.selectedNote) {
        return this.selectedNote.content.split('').length
      }
    }
  },

  // Change watchers
  watch: {
    notes: {
      handler: 'saveNotes',
      deep: true
    },
    selectedId (val) {
      localStorage.setItem('selected-id',val)
    }
  },

  methods: {
    addNote () {
      const time = Date.now()
      const note = {
        id: String(time),
        title: 'New note' + (this.notes.length + 1),
        content: '**hi**',
        created: time,
        favorite: false
      }
      this.notes.push(note)
    },
    selectNote (note) {
        this.selectedId =  (this.selectedId === note.id) ? null : note.id
    },
    saveNotes () {
      // 在不同会话之间同步笔记
      localStorage.setItem('notes',JSON.stringify(this.notes))
    },
    removeNote () {
      if(this.selectedNote && confirm('确定要删除吗？')) {
        const index = this.notes.indexOf(this.selectedNote)
        if (index !== -1) {
          this.notes.splice(index,1)
        }
      }
    },
    favoriteNote () {
      this.selectedNote.favorite ^= true
    }
  },

  filters: {
    date: function (time) {
      return moment(time).format('DD/MM/YY, HH:m')
    }
  }
})
