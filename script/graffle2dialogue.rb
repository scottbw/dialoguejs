#!/usr/local/bin/macruby

framework "ScriptingBridge"
require 'json'

#
# Based on Graffle2Json 
# https://github.com/hoverbird/convo/blob/master/script/graffle2json.rb
#

class GraffleConverter
  def initialize
    @graffle = SBApplication.applicationWithBundleIdentifier("com.omnigroup.OmniGraffle")
    if @graffle.nil? 
      @graffle = SBApplication.applicationWithBundleIdentifier("com.omnigroup.OmniGrafflePro")
    end
  end

  def to_txt
    @root_node = 0

    #
    # In OG 4, its called "canvases", in OG 3 its "pages"
    #
    begin
      @shapes = @graffle.windows[0].document.canvases[0].layers[0].shapes
    rescue
      @shapes = @graffle.windows[0].document.pages[0].layers[0].shapes    
    end
    
    #
    # Find the root node of the tree
    #    
    @shapes.select do |s| 
        if (s.incomingLines.length == 0 and s.outgoingLines.length > 1)
            @root_node = s.id
        end
    end

    
    out = ""    
    
    #
    # Process each node
    #
    @shapes.select do |s| 
        children = process_node (s)
        

        #
        # The root node we number as 0
        #        
        if (s.id == @root_node)
            out += "0"
        else
            out += s.id.to_s()
        end
        
        out += " "
        out += s.text.get
        
        #
        # If there is only on child, output -> id
        #
        if (children.length == 1)
            if (children[0] == @root_node)
                out += " -> 0"
            else
                out += " -> " + children[0]
            end
        #
        # For multiple children, output [choice1, choice2]
        #
        elsif (children.length > 1)
            out += " ["
            out += children.join(",")
            out += "]"
        end 
        
        out += "\n"
    end
    
    return out
    
  end

  #
  # For each outgoing line, add the target shape id to an array and return it
  #
  private
  def process_node(shape)
    raise ArgumentError, "No shape passed" unless shape

    children = []

    shape.outgoingLines.each do |line|
      children << line.destination.valueForKey("id").to_s()
    end
    
    return children
  end
end

txt = GraffleConverter.new.to_txt()
File.open('dialogue.txt', 'w') {|f| f.write txt }
