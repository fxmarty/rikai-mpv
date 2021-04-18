-- rikai-mpv
-- v. 0.1
--
-- This file is largely inspired by interSubs script: https://github.com/oltodosel/interSubs
-- 
-- Interactive Japanese subtitles for mpv for language learners.
--
-- default keybinding to start/stop: F5/F7
-- default keybinding to hide/show: F6

start_command = 'python3 "%s" "%s" "%s"'

-- recomend to have these in tmpfs, or at least ssd.
sub_file = '/tmp/mpv_sub'
mpv_socket = '/tmp/mpv_socket'

keybinding = 'F5'
keybinding_hide = 'F6'
keybinding_out = 'F7'

pyname = os.getenv("HOME") .. '/.config/mpv/scripts/rikai-mpv/subtitles_popup_graphics.py'

------------------------------------------------------

-- should not be called when already running
function s1()
	running = true
    
    -- secondary sid has to be off when called
    id_second = mp.get_property('secondary-sid')
    if id_second ~= 'no' then
        mp.set_property_bool('secondary-sid', false)
    end
    
	mp.msg.warn('Starting rikai-mpv...')
	mp.register_event("end-file", get_out)
	rnbr = math.random(11111111, 99999999)

	mpv_socket_2 = mpv_socket .. '_' .. rnbr
	sub_file_2 =  sub_file .. '_' .. rnbr
	
	-- setting up socket to control mpv
	mp.set_property("input-ipc-server", mpv_socket_2)
	
	-- without visible subs won't work
	sbv = mp.get_property("sub-visibility")
	mp.set_property("sub-visibility", "yes")
    
	mp.set_property("sub-ass-override", "force")
	
    -- this is a trick to set subtitle invisible
	sub_color1 = mp.get_property("sub-color")
	sub_color2 = mp.get_property("sub-border-color")
	sub_color3 = mp.get_property("sub-shadow-color")
    sub_color4 = mp.get_property("sub-back-color")
	mp.set_property("sub-color", "0/0/0/0")
	mp.set_property("sub-border-color", "0/0/0/0")
	mp.set_property("sub-shadow-color", "0/0/0/0")
    mp.set_property("sub-back-color", "0/0/0/0")
    
	start_command_2 = start_command:format(pyname, mpv_socket_2, sub_file_2)
	os.execute(start_command_2 .. ' &')

	mp.observe_property("sub-text", "string", s2)
    
    if id_second ~= 'no' then
        mp.set_property_number('secondary-sid', id_second)
    end
end

function s2(name, value)
	if type(value) == "string" then
		file = io.open(sub_file_2, "w")
		file:write(value)
		file:close()
	end
end

function s_rm()
	running = false
	hidden = false
	mp.msg.warn('Quitting rikai-mpv...')
    
    -- we need to circle through subs first
    
	mp.set_property("sub-color", sub_color1)
	mp.set_property("sub-border-color", sub_color2)
	mp.set_property("sub-shadow-color", sub_color3)
    mp.set_property("sub-back-color", sub_color4)
    
    mp.set_property("sub-visibility", sbv)
    
    -- kill node first
    os.execute("kill $(ps aux |grep node|grep mpv_socket |awk '{print $2}')")
    
    -- then, kill python
	os.execute('pkill -f "' .. mpv_socket_2 .. '" &')
    
	os.execute('(sleep 1 && rm "' .. mpv_socket_2 .. '") &')
	os.execute('(sleep 1 && rm "' .. sub_file_2 .. '") &')
    print('Finished exiting.')
end

function s1_1()
	if running == true then
		print("Already running.")
		
	else
		if mp.get_property("sub") == 'no' then
			mp.command('show-text "Select subtitles before starting rikai-mpv."')
		else
			s1()
			mp.command('show-text "Starting rikai-mpv..."')
		end
	end
end

function get_out()
    if running == true then
        s_rm()
        mp.command('show-text "Quitting rikai-mpv..."')
    else
        print('Not running.')
    end
end
    

mp.add_forced_key_binding(keybinding, "start-stop-rikai-mpv", s1_1)
mp.add_forced_key_binding(keybinding_out, "hide-show-rikai-mpv", get_out)
