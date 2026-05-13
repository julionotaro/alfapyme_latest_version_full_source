import { useEffect, useMemo, useState } from 'react'
import {
  fetchCases,
  fetchChecklist,
  fetchDocuments,
  getDocumentSignedUrl,
  reconcileChecklistTemplate,
  updateCaseStatus,
  updateChecklist,
  uploadDocument,
} from './services/core'
import { evaluateExpedient, projectChecklistFromRequirement, resolveWorkflowTransition } from './domain/tyrion'
import { Sidebar } from './components/Sidebar'
import { Topbar } from './components/Topbar'
import { FlashMessage } from './components/FlashMessage'
import { WorkspaceView } from './views/WorkspaceView'
import { UploadView } from './views/UploadView'
import { ViewerView } from './views/ViewerView'
import { OutputView } from './views/OutputView'
import { CopilotView } from './views/CopilotView'
import { HistoryView } from './views/HistoryView'
import './style.css'

export default function App() {
  const [view, setView] = useState('workspace')
  const [cases, setCases] = useState([])
  const [selected, setSelected] = useState(null)
  const [documents, setDocuments] = useState([])
  const [checklist, setChecklist] = useState([])
  const [activeDoc, setActiveDoc] = useState(null)
  const [docUrl, setDocUrl] = useState(null)
  const [message, setMessage] = useState('')
  const [tyrionAssessment, setTyrionAssessment] = useState(null)
  const [tyrionTransition, setTyrionTransition] = useState(null)

  async function loadCasesList() {
    try {
      const rows = await fetchCases()
      setCases(rows)
      setSelected((current) => (current ? rows.find((item) => item.id === current.id) || rows[0] : rows[0]))
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function loadCaseDetails(caseId) {
    if (!caseId) return

    try {
      const docs = await fetchDocuments(caseId)
      const items = await fetchChecklist(caseId)
      const currentCase = cases.find((item) => item.id === caseId) || selected
      setDocuments(docs)
      if (currentCase) {
        const assessment = evaluateExpedient({ caseData: currentCase, documents: docs })
        const reconciledItems = await reconcileChecklistTemplate({
          caseData: currentCase,
          documents: docs,
          checklist: items,
        })
        const projectedChecklist = projectChecklistFromRequirement({
          requirement: assessment.requirement,
          checklist: reconciledItems,
          documents: docs,
        })

        setChecklist(projectedChecklist)
        setTyrionAssessment(assessment)
        setTyrionTransition(resolveWorkflowTransition({ caseData: currentCase, assessment }))
      } else {
        setChecklist(items)
      }
      setActiveDoc((current) => current || docs[0] || null)
    } catch (error) {
      setMessage(error.message)
    }
  }

  useEffect(() => {
    loadCasesList()
  }, [])

  useEffect(() => {
    if (selected) {
      loadCaseDetails(selected.id)
    } else {
      setTyrionAssessment(null)
      setTyrionTransition(null)
    }
  }, [selected?.id, cases])

  useEffect(() => {
    if (!activeDoc) {
      setDocUrl(null)
      return
    }

    getDocumentSignedUrl(activeDoc)
      .then(setDocUrl)
      .catch((error) => setMessage(error.message))
  }, [activeDoc?.id])

  const missingBlocking = useMemo(
    () => checklist.filter((item) => item.is_blocking && item.status === 'missing').length,
    [checklist],
  )

  async function validateItem(item) {
    if (!item?.id || String(item.id).startsWith('required:') || String(item.id).startsWith('recommended:')) {
      setMessage('Este ítem aún no existe en base de datos. Valida primero el documento real asociado.')
      return
    }

    await updateChecklist(item.id, {
      status: 'validated',
      validation_status: 'validated',
    })
    await loadCaseDetails(selected.id)
  }

  async function applyTyrionSuggestion() {
    if (!selected || !tyrionTransition?.nextStatus) return

    const updatedCase = await updateCaseStatus(selected.id, tyrionTransition.nextStatus)
    setCases((current) => current.map((item) => (item.id === updatedCase.id ? updatedCase : item)))
    setSelected(updatedCase)
    setMessage(`Tyrion aplicó estado sugerido: ${tyrionTransition.nextStatus}`)
  }

  async function moveToOutput() {
    if (missingBlocking > 0) {
      setMessage(`Faltan documentos bloqueantes: ${missingBlocking}`)
      return
    }

    const updatedCase = await updateCaseStatus(selected.id, 'ready_for_output')
    setCases((current) => current.map((item) => (item.id === updatedCase.id ? updatedCase : item)))
    setSelected(updatedCase)
    setView('output')
    setMessage('Caso listo para salida.')
  }

  async function handleUploadFiles(files) {
    if (!selected) return

    for (const file of files) {
      await uploadDocument({
        caseId: selected.id,
        organizationId: selected.organization_id,
        file,
      })
    }

    await loadCaseDetails(selected.id)
    await loadCasesList()
    setMessage(`${files.length} documento(s) cargados.`)
  }

  return (
    <div className="app">
      <Sidebar view={view} onChange={setView} />

      <main>
        <Topbar view={view} onRefresh={loadCasesList} />
        <FlashMessage message={message} onClose={() => setMessage('')} />

        {view === 'workspace' && (
          <WorkspaceView
            cases={cases}
            selected={selected}
            setSelected={setSelected}
            checklist={checklist}
            documents={documents}
            onValidateItem={validateItem}
            onReady={moveToOutput}
            onApplyTyrionSuggestion={applyTyrionSuggestion}
            setActiveDoc={setActiveDoc}
            setView={setView}
            missingBlocking={missingBlocking}
            tyrionAssessment={tyrionAssessment}
            tyrionTransition={tyrionTransition}
          />
        )}

        {view === 'upload' && (
          <UploadView
            selected={selected}
            cases={cases}
            setSelected={setSelected}
            onUploadFiles={handleUploadFiles}
          />
        )}

        {view === 'viewer' && (
          <ViewerView
            selected={selected}
            documents={documents}
            activeDoc={activeDoc}
            setActiveDoc={setActiveDoc}
            docUrl={docUrl}
            checklist={checklist}
          />
        )}

        {view === 'output' && <OutputView />}
        {view === 'copilot' && <CopilotView />}
        {view === 'history' && <HistoryView selected={selected} />}
      </main>
    </div>
  )
}
