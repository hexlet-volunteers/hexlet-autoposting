import { Spotlight, type SpotlightActionData } from '@mantine/spotlight'
import {
  IconCalendar,
  IconList,
  IconSearch,
  IconFolder,
  IconChartBar,
  IconUsers,
  IconSettings,
  IconPlus,
  IconFileText,
} from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import { useProjects } from '@/entities/project'
import { useContentPlan } from '@/entities/scheduled-post'
import { useMedia } from '@/entities/media'
import { NETWORKS } from '@/shared/config'
import dayjs from 'dayjs'

interface CommandPaletteProps {
  onCreatePost: () => void
  onSelectProject: (id: string) => void
  onOpenPost: (postId: string) => void
}

export function CommandPalette({ onCreatePost, onSelectProject, onOpenPost }: CommandPaletteProps) {
  const navigate = useNavigate()
  const { data: projects = [] } = useProjects()
  const { data: posts } = useContentPlan()
  const { data: media = [] } = useMedia()
  const projectActions: SpotlightActionData[] = projects
    .filter((project) => !project.archived)
    .map((project) => ({
      id: `project-${project.id}`,
      label: `Проект: ${project.name}`,
      description: 'Переключить проект',
      leftSection: <IconFolder size={18} />,
      onClick: () => onSelectProject(project.id),
    }))

  const postActions: SpotlightActionData[] = posts.map((post) => {
    const networks = post.networkIds
      .map((id) => NETWORKS.find((network) => network.id === id)?.name ?? id)
      .join(', ')

    return {
      id: `post-${post.id}`,
      label: post.title,
      description: `${dayjs(post.scheduledAt).format('DD.MM.YYYY HH:mm')} · ${networks}`,
      keywords: [post.text],
      leftSection: <IconFileText size={18} />,
      onClick: () => onOpenPost(post.id),
    }
  })

  const mediaActions: SpotlightActionData[] = media.map((file) => ({
    id: `media-${file.id}`,
    label: file.name,
    description: `Медиатека · ${file.kind === 'photo' ? 'Фото' : 'Видео'} · ${file.sizeLabel}`,
    leftSection: <IconFolder size={18} />,
    onClick: () => navigate('/app/media'),
  }))

  const actions: SpotlightActionData[] = [
    ...projectActions,
    {
      id: 'new-post',
      label: 'Новый пост',
      description: 'Создать публикацию',
      leftSection: <IconPlus size={18} />,
      onClick: () => onCreatePost(),
    },
    {
      id: 'calendar',
      label: 'Календарь',
      description: 'Перейти в календарь',
      leftSection: <IconCalendar size={18} />,
      onClick: () => navigate('/app/calendar'),
    },
    {
      id: 'queue',
      label: 'Очередь',
      description: 'Перейти в очередь',
      leftSection: <IconList size={18} />,
      onClick: () => navigate('/app/queue'),
    },
    {
      id: 'media',
      label: 'Медиатека',
      description: 'Перейти в медиатеку',
      leftSection: <IconFolder size={18} />,
      onClick: () => navigate('/app/media'),
    },
    {
      id: 'reports',
      label: 'Отчёты',
      description: 'Перейти в отчёты',
      leftSection: <IconChartBar size={18} />,
      onClick: () => navigate('/app/reports'),
    },
    {
      id: 'team',
      label: 'Команда',
      description: 'Перейти к команде',
      leftSection: <IconUsers size={18} />,
      onClick: () => navigate('/app/team'),
    },
    {
      id: 'settings',
      label: 'Настройки',
      description: 'Перейти в настройки',
      leftSection: <IconSettings size={18} />,
      onClick: () => navigate('/app/settings'),
    },
    ...postActions,
    ...mediaActions,
  ]

  return (
    <Spotlight
      actions={actions}
      limit={20}
      nothingFound="Ничего не найдено"
      highlightQuery
      searchProps={{
        placeholder: 'Найти пост или действие...',
        leftSection: <IconSearch size={18} />,
      }}
    />
  )
}
