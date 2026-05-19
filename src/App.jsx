import { useEffect, useMemo, useState } from 'react'
import {
  createProvisionalCase,
  fetchCases,
  fetchChecklist,
  fetchDocuments,
  getDocumentSignedUrl,
  reconcileChecklistTemplate,
  updateCaseStatus,
  updateChecklist,
  uploadDocument,
} from './services/core'
import { evaluateExpedient, projectChecklistFromRequirement, resolveWorkflowTransition } from './domain/tyrion/index.js'
import { inspectDocument } from './lib/document-ingestion'
import { getBusinessTemplate } from './domain/templates/index.js'
import { Sidebar } from './components/Sidebar'
import { Topbar } from './components/Topbar'
import { FlashMessage } from './components/FlashMessage'
import { HomeView } from './views/HomeView'
import { WorkspaceView } from './views/WorkspaceView'
import { UploadView } from './views/UploadView'
import { ValidationView } from './views/ValidationView'
import { ViewerView } from './views/ViewerView'
import { OutputView } from './views/OutputView'
import { HistoryView } from './views/HistoryView'
import { SettingsView } from './views/SettingsView'
import './style.css'

export default function App() {
  const [view, setView] = useState('home')
  const [cases, setCases] = useState([])
  const [selected, setSelected] = useState(null)
  const [documents, setDocuments] = useState([])
  const [checklist, setChecklist] = useState([])
  const [activeDoc, setActiveDoc] = useState(null)
  const [docUrl, setDocUrl] = useState(null)
  const [message, setMessage] = useState('')
  const [tyrionAssessment, setTyrionAssessment] = useState(null)
  const [tyrionTransition, setTyrionTransition] = useState(null)
  const [uploadInspections, setUploadInspections] = useState([])

  const selectedBusinessTemplate = useMemo(() => getBusinessTemplate(selected || {}), [selected])

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

  async function handleUploadFiles(files, preferredCase = null) {
    let targetCase = preferredCase || selected

    if (!targetCase) {
      targetCase = await createProvisionalCase({
        template: selectedBusinessTemplate?.key || 'gestoria_dgt',
        businessLine: selectedBusinessTemplate?.key || 'gestoria_dgt',
        sourceChannel: 'manual_upload',
      })
      setSelected(targetCase)
      setCases((current) => [targetCase, ...current])
    }

    for (const file of files) {
      await uploadDocument({
        caseId: targetCase.id,
        organizationId: targetCase.organization_id,
        file,
      })
    }

    await loadCasesList()
    await loadCaseDetails(targetCase.id)
    setSelected(targetCase)
    setMessage(`${files.length} documento(s) cargados en ${targetCase.public_id}.`)
  }

  async function inspectUploadFiles(files) {
    const results = []

    for (const file of files) {
      const inspection = await inspectDocument(file)
      results.push(inspection)
    }

    setUploadInspections(results)
    setMessage(`Preanálisis completado para ${results.length} documento(s).`)
  }

  return (
    <div className="app">
      <Sidebar view={view} onChange={setView} />

      <main>
        <Topbar view={view} onRefresh={loadCasesList} />
        <FlashMessage message={message} onClose={() => setMessage('')} />

        {view === 'home' && (
          <HomeView
            cases={cases}
            onSelectCase={(item) => {
              setSelected(item)
              setView('workspace')
            }}
            onGoToTray={() => setView('workspace')}
          />
        )}

        {view === 'workspace' && (
          <WorkspaceView
            cases={cases}
            selected={selected}
            selectedBusinessTemplate={selectedBusinessTemplate}
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
            selectedBusinessTemplate={selectedBusinessTemplate}
            cases={cases}
            setSelected={setSelected}
            onUploadFiles={handleUploadFiles}
            inspections={uploadInspections}
            onInspectFiles={inspectUploadFiles}
          />
        )}

        {view === 'validation' && (
          <ValidationView
            cases={cases}
            selected={selected}
            onSelectCase={setSelected}
            onOpenTray={() => setView('workspace')}
            onOpenDocuments={() => setView('viewer')}
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
        {view === 'history' && <HistoryView selected={selected} />}
        {view === 'settings' && <SettingsView />}
      </main>
    </div>
  )
}
